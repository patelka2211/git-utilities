import { resolve } from "path";
import { localBranches } from "../src/local-branches";
import { getParentCommits } from "../src/parent-commits";

(async () => {
    const repoPath = resolve("./"),
        branches = await localBranches(repoPath);

    if (branches.type === "ERROR") {
        console.log(branches.msg);
        return;
    }

    if (branches.data !== undefined) {
        for (const branch of branches.data) {
            const result = await getParentCommits(repoPath, branch.pointsAt);

            if (result.type === "SUCCESS") {
                const { parentList, splitsInto } = result.data;

                console.log({
                    branch: branch.name,
                    parentList,
                    splitsInto,
                });
            } else {
                console.log({
                    branch: branch.name,
                    errorMsg: result.msg,
                });
            }
        }
    }
})();
