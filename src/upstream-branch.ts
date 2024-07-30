import { GitProcess } from "dugite";
import { isGitRepo } from "./helpers/is-git-repo";
import { affirmativeResponse, negativeResponse } from "./helpers/responses";

export async function getUpstreamBranch(
    repoPath: string,
    branch: string
): Promise<
    | { type: "ERROR"; msg: "Not a Git repository."; data?: undefined }
    | {
          type: "ERROR";
          msg: "Not able to find upstream branch.";
          data?: undefined;
      }
    | {
          type: "SUCCESS";
          data: { name: string; origin: string };
          msg?: undefined;
      }
> {
    const isItRepo = await isGitRepo(repoPath);

    if (isItRepo.type === "ERROR") return isItRepo;

    const { exitCode, stdout } = await GitProcess.exec(
        ["rev-parse", "--abbrev-ref", `${branch}@{upstream}`],
        repoPath
    );

    if (exitCode !== 0)
        return negativeResponse("Not able to find upstream branch." as const);

    const origin = stdout.replace("\n", "");

    return affirmativeResponse({
        name: origin.replace("origin/", ""),
        origin,
    });
}
