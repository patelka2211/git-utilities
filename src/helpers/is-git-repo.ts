import { stat } from "fs/promises";
import { resolve } from "path";

export async function isGitRepo(repoPath: string) {
    try {
        let result = await stat(resolve(repoPath, ".git"));

        if (result.isDirectory() !== true)
            return {
                type: "ERROR" as const,
                msg: "Not a Git repository." as const,
            };

        return {
            type: "SUCCESS" as const,
        };
    } catch {
        return {
            type: "ERROR" as const,
            msg: "Not a Git repository." as const,
        };
    }
}
