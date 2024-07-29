import { resolve } from "path";
import { getDefaultBranch } from "../src/default-branch";

(async () => {
    console.log(await getDefaultBranch(resolve("./")));
})();
