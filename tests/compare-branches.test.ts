import { resolve } from "path";
import { compareBranches } from "../src/compare-branches";

(async () => {
    const result = await compareBranches(resolve("./"), "main", "origin/main");

    console.log(result);
})();
