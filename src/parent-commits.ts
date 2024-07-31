import { GitProcess } from "dugite";
import { isGitRepo } from "./helpers/is-git-repo";
import { affirmativeResponse, negativeResponse } from "./helpers/responses";

interface Options {
    /**
     * Maximum parent commits returned.
     *
     * Default value: `50`
     */
    maximumParents?: number;
    abbreviatedHash?: boolean;
}

async function getParent(
    repoPath: string,
    currentCommitHash: string,
    abbreviatedHash: boolean
): Promise<
    | { type: "ERROR"; msg: "Can not find parent commit."; data?: undefined }
    | { type: "SUCCESS"; data: string[]; msg?: undefined }
    | { type: "SUCCESS"; data: string; msg?: undefined }
> {
    const { exitCode, stdout } = await GitProcess.exec(
        [
            "log",
            "-1",
            `--format=%${abbreviatedHash ? "p" : "P"}`,
            currentCommitHash,
        ],
        repoPath
    );

    if (exitCode !== 0)
        return negativeResponse("Can not find parent commit." as const);

    if (stdout.includes(" "))
        return affirmativeResponse(stdout.replace("\n", "").split(" "));
    else return affirmativeResponse(stdout.replace("\n", ""));
}

export async function getParentCommits(
    repoPath: string,
    currentCommitHash?: string,
    options?: Options
): Promise<
    | { type: "ERROR"; msg: "Not a Git repository."; data?: undefined }
    | {
          type: "SUCCESS";
          data: {
              parentList: string[] | undefined;
              splitsInto: string[] | undefined;
          };
          msg?: undefined;
      }
    | { type: "ERROR"; msg: "Can not find parent commit." }
> {
    const isItRepo = await isGitRepo(repoPath);

    if (isItRepo.type === "ERROR") return isItRepo;

    if (currentCommitHash === undefined) currentCommitHash = "";
    if (options === undefined) options = {};
    if (options.maximumParents === undefined) options.maximumParents = 50;
    if (options.abbreviatedHash === undefined) options.abbreviatedHash = true;

    let parentList: Array<string> | undefined = undefined,
        splitsInto: Array<string> | undefined = undefined;

    do {
        const { type, data, msg } = await getParent(
            repoPath,
            currentCommitHash,
            options.abbreviatedHash
        );

        if (type === "ERROR") {
            return {
                type,
                msg,
            };
        }

        if (typeof data === "object") {
            splitsInto = data;
            break;
        }

        if (parentList === undefined) {
            parentList = [data];
        } else {
            parentList = [...parentList, data];
        }

        currentCommitHash = data;
    } while (!(parentList.length > options.maximumParents));

    return affirmativeResponse({ parentList, splitsInto });
}
