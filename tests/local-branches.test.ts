import { resolve } from "path";
import { localBranches } from "../src/local-branches";

(async () => {
    console.log(await localBranches(resolve("./")));
})();
