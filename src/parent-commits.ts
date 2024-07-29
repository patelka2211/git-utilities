import { GitProcess } from "dugite";
import { assertGitRepo } from "./helpers/assert-git-repo";

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
) {
    const { stderr, stdout } = await GitProcess.exec(
        [
            "log",
            "-1",
            `--format=%${abbreviatedHash ? "p" : "P"}`,
            currentCommitHash,
        ],
        repoPath
    );

    if (stderr === "") {
        if (stdout.includes(" ")) {
            return {
                type: "SUCCESS" as const,
                data: stdout.replace("\n", "").split(" "),
            };
        } else {
            return { type: "SUCCESS" as const, data: stdout.replace("\n", "") };
        }
    } else {
        return {
            type: "ERROR" as const,
            msg: "CAN NOT FIND PARENT COMMITS" as const,
        };
    }
}

export async function getParentCommits(
    repoPath: string,
    currentCommitHash?: string,
    options?: Options
) {
    await assertGitRepo(repoPath);

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

    return { type: "SUCCESS" as const, data: { parentList, splitsInto } };
}
