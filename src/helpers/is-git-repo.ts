import { stat } from "fs/promises";
import { resolve } from "path";

export async function isGitRepo(repoPath: string) {
    try {
        let result = await stat(resolve(repoPath, ".git"));

        if (result.isDirectory() === true) return true;
        else throw Error(`"${repoPath}" is not a Git repository.`);
    } catch {
        throw Error(`"${repoPath}" is not a Git repository.`);
    }
}
