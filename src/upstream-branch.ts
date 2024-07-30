import { GitProcess } from "dugite";
import { isGitRepo } from "./helpers/is-git-repo";

export async function getUpstreamBranch(repoPath: string, branch: string) {
    const isItRepo = await isGitRepo(repoPath);

    if (isItRepo.type === "ERROR") return isItRepo;

    const { exitCode, stdout } = await GitProcess.exec(
        ["rev-parse", "--abbrev-ref", `${branch}@{upstream}`],
        repoPath
    );

    if (exitCode !== 0)
        return {
            type: "ERROR" as const,
            msg: "Not able to find upstream branch." as const,
        };

    const origin = stdout.replace("\n", "");

    return {
        type: "SUCCESS" as const,
        data: {
            name: origin.replace("origin/", ""),
            origin,
        },
    };
}
