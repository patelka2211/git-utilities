import { GitProcess } from "dugite";
import { isGitRepo } from "./helpers/is-git-repo";
import { affirmativeResponse, negativeResponse } from "./helpers/responses";

export async function getDefaultBranch(
    repoPath: string
): Promise<
    | { type: "ERROR"; msg: "Not a Git repository."; data?: undefined }
    | { type: "ERROR"; msg: "Error reading remote branches."; data?: undefined }
    | { type: "SUCCESS"; data: string; msg?: undefined }
    | {
          type: "ERROR";
          msg: 'No "origin/HEAD" remote branch found.';
          data?: undefined;
      }
> {
    const isItRepo = await isGitRepo(repoPath);

    if (isItRepo.type === "ERROR") return isItRepo;

    const { exitCode, stdout } = await GitProcess.exec(
        ["branch", "-r", "--contains=origin/HEAD"],
        repoPath
    );

    if (exitCode !== 0) {
        return negativeResponse("Error reading remote branches." as const);
    }

    try {
        for (let branch of stdout.split("\n")) {
            branch = branch.trim();
            if (branch.startsWith("origin/HEAD"))
                return affirmativeResponse(
                    branch.split("-> ")[1].replace("origin/", "")
                );
        }
    } catch (error) {}

    return negativeResponse('No "origin/HEAD" remote branch found.' as const);
}
