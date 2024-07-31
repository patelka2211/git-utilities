import { resolve } from "path";
import { deleteBranch } from "../src/delete-branch";

(async () => {
    const repo = resolve("./");
    console.log(await deleteBranch(repo, "temp"));
})();
