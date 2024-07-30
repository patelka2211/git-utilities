import { stat } from "fs/promises";
import { resolve } from "path";
import { affirmativeResponse, negativeResponse } from "./responses";

export async function isGitRepo(
    repoPath: string
): Promise<
    | { type: "ERROR"; msg: "Not a Git repository."; data?: undefined }
    | { type: "SUCCESS"; data: null; msg?: undefined }
> {
    try {
        let result = await stat(resolve(repoPath, ".git"));

        if (result.isDirectory() !== true)
            return negativeResponse("Not a Git repository." as const);

        return affirmativeResponse(null);
    } catch {
        return negativeResponse("Not a Git repository." as const);
    }
}
