import { GitProcess } from "dugite";
import { compareBranches } from "./compare-branches";
import { isGitRepo } from "./helpers/is-git-repo";
import { affirmativeResponse, negativeResponse } from "./helpers/responses";
import { getUpstreamBranch } from "./upstream-branch";

interface Options {
    /**
     * Default: `false`
     */
    forceDelete?: boolean;
}

async function compareWithRemoteBranch(
    repoPath: string,
    branch1: string,
    branch2: string
): Promise<
    | { type: "ERROR"; msg: "Not a Git repository."; data?: undefined }
    | { type: "ERROR"; msg: "Not able to compare branches."; data?: undefined }
    | {
          type: "ERROR";
          msg: "Error occurred while parsing data for comparing branches.";
          data?: undefined;
      }
    | { type: "SUCCESS"; data: null; msg?: undefined }
    | { type: "ERROR"; msg: { ahead: number }; data?: undefined }
> {
    const branchComparison = await compareBranches(repoPath, branch1, branch2);

    if (branchComparison.type === "SUCCESS") {
        if (branchComparison.data.ahead === 0) {
            return affirmativeResponse(null);
        } else {
            return negativeResponse({
                ahead: branchComparison.data.ahead,
            });
        }
    } else {
        return branchComparison;
    }
}

async function _deleteBranch(
    repoPath: string,
    branch: string,
    forceDelete?: boolean
): Promise<
    | { type: "SUCCESS"; data: string[]; msg?: undefined }
    | { type: "ERROR"; msg: string[]; data?: undefined }
> {
    const { exitCode, stderr, stdout } = await GitProcess.exec(
        ["branch", forceDelete === true ? "-D" : "-d", branch],
        repoPath
    );

    if (exitCode === 0) {
        return affirmativeResponse(
            stdout.split("\n").filter((value) => (value !== "" ? true : false))
        );
    } else {
        return negativeResponse(
            stderr.split("\n").filter((value) => (value !== "" ? true : false))
        );
    }
}

export async function deleteBranch(
    repoPath: string,
    branch: string,
    options?: Options
): Promise<
    | { type: "ERROR"; msg: "Not a Git repository."; data?: undefined }
    | { type: "SUCCESS"; data: string[]; msg?: undefined }
    | { type: "ERROR"; msg: string[]; data?: undefined }
    | {
          type: "ERROR";
          msg: `Branch ${string} might be ahead of it's remote branch.`;
          data?: undefined;
      }
    | {
          type: "ERROR";
          msg: `Branch "${string}" is ${number} commit(s) ahead of "${string}".`;
          data?: undefined;
      }
    | {
          type: "ERROR";
          msg: `Branch "${string}" might not be fully merged with the default branch.`;
          data?: undefined;
      }
> {
    const isItRepo = await isGitRepo(repoPath);

    if (isItRepo.type === "ERROR") return isItRepo;

    // setting the default value of optional parameters
    if (options === undefined) options = {};
    if (options.forceDelete === undefined) options.forceDelete = false;

    if (options.forceDelete === true) {
        return _deleteBranch(repoPath, branch, true);
    }

    const upstreamBranch = await getUpstreamBranch(repoPath, branch);

    // upstream branch found
    if (upstreamBranch.type === "SUCCESS") {
        let compareWithUpstreamBranch = await compareWithRemoteBranch(
            repoPath,
            branch,
            upstreamBranch.data.origin
        );

        if (compareWithUpstreamBranch.type === "SUCCESS") {
            return _deleteBranch(repoPath, branch);
        } else {
            if (
                compareWithUpstreamBranch.msg ===
                    "Not able to compare branches." ||
                compareWithUpstreamBranch.msg ===
                    "Error occurred while parsing data for comparing branches."
            ) {
                return negativeResponse(
                    `Branch ${branch} might be ahead of it's remote branch.` as const
                );
            } else if (
                compareWithUpstreamBranch.msg === "Not a Git repository."
            ) {
                return compareWithUpstreamBranch;
            } else {
                return negativeResponse(
                    `Branch "${branch}" is ${compareWithUpstreamBranch.msg.ahead} commit(s) ahead of "${upstreamBranch.data.origin}".` as const
                );
            }
        }
    }

    // upstream branch not found
    if (upstreamBranch.msg === "Not a Git repository.") return upstreamBranch;

    let compareWithOriginHEAD = await compareWithRemoteBranch(
        repoPath,
        branch,
        "origin/HEAD"
    );

    if (compareWithOriginHEAD.type === "SUCCESS") {
        return _deleteBranch(repoPath, branch);
    } else {
        if (
            compareWithOriginHEAD.msg === "Not able to compare branches." ||
            compareWithOriginHEAD.msg ===
                "Error occurred while parsing data for comparing branches."
        ) {
            return negativeResponse(
                `Branch "${branch}" might not be fully merged with the default branch.` as const
            );
        } else if (compareWithOriginHEAD.msg === "Not a Git repository.") {
            return compareWithOriginHEAD;
        } else {
            return negativeResponse(
                `Branch "${branch}" is ${compareWithOriginHEAD.msg.ahead} commit(s) ahead of "origin/HEAD".` as const
            );
        }
    }
}
