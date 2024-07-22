import { resolve } from "path";
import { localBranches } from "../src/helpers/local-branches";

(async () => {
    console.log(await localBranches(resolve("./")));
})();
