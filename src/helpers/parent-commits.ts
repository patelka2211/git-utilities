import { GitProcess } from "dugite";
import { assertGitRepo } from "./assert-git-repo";

export async function getParentCommits(
    repoPath: string,
    currentCommitHash?: string,
    howManyParents?: number
) {
    await assertGitRepo(repoPath);

    if (currentCommitHash === undefined) currentCommitHash = "";
    if (howManyParents === undefined) howManyParents = 50;

    let { stderr, stdout } = await GitProcess.exec(
        ["log", `-${howManyParents}`, "--format=%P", currentCommitHash],
        repoPath
    );

    if (stderr === "") {
        let result = stdout
            .split("\n")
            .filter((value) => (value !== "" ? true : false))
            .map((value) => {
                if (value.includes(" ") === true) return value.split(" ");
                else return value;
            });

        return result;
    } else throw new Error(stderr);
}
