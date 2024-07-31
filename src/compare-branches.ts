import { GitProcess } from "dugite";
import { isGitRepo } from "./helpers/is-git-repo";
import { affirmativeResponse, negativeResponse } from "./helpers/responses";

export async function compareBranches(
    repoPath: string,
    branch1: string,
    branch2: string
): Promise<
    | { type: "ERROR"; msg: "Not a Git repository."; data?: undefined }
    | { type: "ERROR"; msg: "Not able to compare branches."; data?: undefined }
    | {
          type: "SUCCESS";
          data: {
              [x: string]: {
                  ahead: number;
                  behind: number;
                  comparedTo: string;
              };
          };
          msg?: undefined;
      }
    | {
          type: "ERROR";
          msg: "Error occurred while parsing data for comparing branches.";
          data?: undefined;
      }
> {
    const isItRepo = await isGitRepo(repoPath);

    if (isItRepo.type === "ERROR") return isItRepo;

    const { exitCode, stdout } = await GitProcess.exec(
        ["rev-list", "--count", "--left-right", `${branch1}...${branch2}`],
        repoPath
    );

    if (exitCode !== 0) {
        return negativeResponse("Not able to compare branches." as const);
    }

    try {
        let [left, right] = stdout
            .replace("\n", "")
            .split("\t")
            .map((value) => +value);

        return affirmativeResponse({
            [branch1]: { ahead: left, behind: right, comparedTo: branch2 },
            [branch2]: { ahead: right, behind: left, comparedTo: branch1 },
        });
    } catch (error) {}

    return negativeResponse(
        "Error occurred while parsing data for comparing branches." as const
    );
}
