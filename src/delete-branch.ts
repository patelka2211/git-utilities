import { isGitRepo } from "./helpers/is-git-repo";
import { getUpstreamBranch } from "./upstream-branch";

export async function deleteBranch(repoPath: string, branch: string) {
    const isItRepo = await isGitRepo(repoPath);

    if (isItRepo.type === "ERROR") return isItRepo;

    const resultOfUpstreamBranch = await getUpstreamBranch(repoPath, branch);

    if (resultOfUpstreamBranch.type === "ERROR") {
        if (resultOfUpstreamBranch.msg === "Not a Git repository.") {
            return resultOfUpstreamBranch;
        }
        resultOfUpstreamBranch;
    }

    resultOfUpstreamBranch;
}
