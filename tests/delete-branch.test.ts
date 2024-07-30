import { resolve } from "path";
import { deleteBranch } from "../src/delete-branch";

(async () => {
    deleteBranch(resolve("./"), "main");
})();
