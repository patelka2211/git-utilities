import { GitProcess } from "dugite";
import { assertGitRepo } from "./assert-git-repo";

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
            return stdout.replace("\n", "").split(" ");
        } else {
            return stdout.replace("\n", "");
        }
    } else {
        throw new Error(stderr);
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
        currentParentCommitHash = await getParent(
            repoPath,
            currentCommitHash,
            options.abbreviatedHash
        ),
        counter = 0;

    while (
        !(
            typeof currentParentCommitHash !== "string" ||
            counter > options.maximumParents
        )
    ) {
        if (parentList === undefined) {
            parentList = [currentParentCommitHash];
        } else {
            parentList = [...parentList, currentParentCommitHash];
        }

        currentParentCommitHash = await getParent(
            repoPath,
            currentParentCommitHash,
            options.abbreviatedHash
        );

        counter++;
    }

    if (typeof currentParentCommitHash === "string") {
        if (counter < options.maximumParents) {
            parentList?.push(currentParentCommitHash);
        }
        return { parentList };
    } else {
        return { parentList, splitsInto: currentParentCommitHash };
    }
}
