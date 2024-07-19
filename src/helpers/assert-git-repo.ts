import { stat } from "fs/promises";
import { resolve } from "path";

export async function assertGitRepo(repoPath: string) {
    try {
        let result = await stat(resolve(repoPath, ".git"));

        if (result.isDirectory() !== true)
            throw Error(`"${repoPath}" is not a Git repository.`);
    } catch {
        throw Error(`"${repoPath}" is not a Git repository.`);
    }
}
