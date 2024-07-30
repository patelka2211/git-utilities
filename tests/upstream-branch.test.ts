import { resolve } from "path";
import { getUpstreamBranch } from "../src/upstream-branch";

(async () => {
    const repoPath = resolve("./"),
        result = await getUpstreamBranch(repoPath, "main");

    console.log(result);
})();
