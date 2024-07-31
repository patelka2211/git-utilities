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
) {
    const branchComparison = await compareBranches(repoPath, branch1, branch2);

    if (branchComparison.type === "SUCCESS") {
        if (branchComparison.data.ahead === 0)
            return affirmativeResponse(
                // "Branch can be deleted." as const
                null
            );
        else
            return negativeResponse({
                ahead: branchComparison.data.ahead,
            });
    } else return negativeResponse("Branch can not be deleted." as const);
}

async function _deleteBranch(
    repoPath: string,
    branch: string,
    forceDelete?: boolean
) {
    const { exitCode } = await GitProcess.exec(
        ["branch", forceDelete === true ? "-D" : "-d", branch],
        repoPath
    );

    if (exitCode === 0) {
        return affirmativeResponse("Branch deleted successfully." as const);
    } else {
        return negativeResponse("Error while deleting the branch." as const);
    }
}

export async function deleteBranch(
    repoPath: string,
    branch: string,
    options?: Options
): Promise<
    | { type: "SUCCESS"; data: "Branch deleted successfully."; msg?: undefined }
    | {
          type: "ERROR";
          msg: "Error while deleting the branch.";
          data?: undefined;
      }
    | { type: "ERROR"; msg: "Not a Git repository."; data?: undefined }
    | {
          type: "ERROR";
          msg:
              | "Branch can not be deleted."
              | `Branch "${string}" is ${number} commit(s) ahead of "${string}".`;
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
            return negativeResponse(
                typeof compareWithUpstreamBranch.msg === "string"
                    ? compareWithUpstreamBranch.msg
                    : (`Branch "${branch}" is ${compareWithUpstreamBranch.msg.ahead} commit(s) ahead of "${upstreamBranch.data.origin}".` as const)
            );
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
        return negativeResponse(
            typeof compareWithOriginHEAD.msg === "string"
                ? compareWithOriginHEAD.msg
                : (`Branch "${branch}" is ${compareWithOriginHEAD.msg.ahead} commit(s) ahead of "origin/HEAD".` as const)
        );
    }
}
