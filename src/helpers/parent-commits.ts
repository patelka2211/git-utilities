import { GitProcess } from "dugite";
import { assertGitRepo } from "./assert-git-repo";

interface Options {
    howManyParents?: number;
    abbreviatedHash?: boolean;
}

export async function getParentCommits(
    repoPath: string,
    currentCommitHash?: string,
    options?: Options
) {
    await assertGitRepo(repoPath);

    if (currentCommitHash === undefined) currentCommitHash = "";
    if (options === undefined) options = {};
    if (options.howManyParents === undefined) options.howManyParents = 50;
    if (options.abbreviatedHash === undefined) options.abbreviatedHash = true;

    let { stderr, stdout } = await GitProcess.exec(
        [
            "log",
            `-${options.howManyParents}`,
            `--format=%${options.abbreviatedHash ? "p" : "P"}`,
            currentCommitHash,
        ],
        repoPath
    );

    if (stderr === "") {
        let result: (string | string[])[] = [];

        stdout.split("\n").forEach((value) => {
            if (value === "") return;
            if (value.includes(" ")) result.push(value.split(" "));
            else result.push(value);
        });

        return result;
    } else throw new Error(stderr);
}
