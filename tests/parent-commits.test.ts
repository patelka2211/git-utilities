import { resolve } from "path";
import { localBranches } from "../src/helpers/local-branches";
import { getParentCommits } from "../src/helpers/parent-commits";

(async () => {
    let repoPath = resolve("./"),
        branches = await localBranches(repoPath);

    if (branches !== undefined) {
        for (const branch of branches) {
            let result = await getParentCommits(repoPath, branch.pointsAt);

            console.log({
                branch: branch.name,
                parents: result,
            });
        }
    }
})();
