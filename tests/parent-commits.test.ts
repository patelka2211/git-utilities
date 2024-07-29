import { resolve } from "path";
import { localBranches } from "../src/local-branches";
import { getParentCommits } from "../src/parent-commits";

(async () => {
    const repoPath = resolve("./"),
        branches = await localBranches(repoPath);

    if (branches !== undefined) {
        for (const branch of branches) {
            const result = await getParentCommits(repoPath, branch.pointsAt);

            if (result.type === "SUCCESS") {
                const { parentList, splitsInto } = result.data;

                console.log({
                    branch: branch.name,
                    parentList,
                    splitsInto,
                });
            }
        }
    }
})();
