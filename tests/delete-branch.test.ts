import { resolve } from "path";
import { deleteBranch } from "../src/delete-branch";

(async () => {
    const repo = resolve("./"),
        result = await deleteBranch(repo, "branch-deletion-functionality");

    if (result.type === "ERROR") {
        console.log(result.msg);
    } else {
        console.log(result.data);
    }
})();
