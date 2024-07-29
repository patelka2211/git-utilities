import { GitProcess } from "dugite";
import { isGitRepo } from "./helpers/is-git-repo";

export async function getDefaultBranch(
    repoPath: string
): Promise<
    | { type: "ERROR"; msg: "Not a Git repository." }
    | { type: "ERROR"; msg: "Error reading remote branches."; data?: undefined }
    | { type: "SUCCESS"; data: string; msg?: undefined }
    | {
          type: "ERROR";
          msg: 'No "origin/HEAD" remote branch found.';
          data?: undefined;
      }
> {
    const isRepo = await isGitRepo(repoPath);

    if (isRepo.type === "ERROR") {
        return isRepo;
    }

    const { stderr, stdout } = await GitProcess.exec(
        ["branch", "-r", "--contains=origin/HEAD"],
        repoPath
    );

    if (stderr) {
        return {
            type: "ERROR" as const,
            msg: "Error reading remote branches." as const,
        };
    }

    try {
        for (let branch of stdout.split("\n")) {
            branch = branch.trim();
            if (branch.startsWith("origin/HEAD"))
                return {
                    type: "SUCCESS" as const,
                    data: branch.split("-> ")[1].replace("origin/", ""),
                };
        }
    } catch (error) {}

    return {
        type: "ERROR" as const,
        msg: 'No "origin/HEAD" remote branch found.' as const,
    };
}
