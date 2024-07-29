import { resolve } from "path";
import { assertGitRepo } from "../src/helpers/assert-git-repo";

(async () => {
    for await (const item of ["./", "./test"]) {
        const { type } = await assertGitRepo(resolve(item));

        if (type === "ERROR") {
            console.log(`"${resolve(item)}"`, "is not a Git repo.");
        } else {
            console.log(`"${resolve(item)}"`, "is a Git repo.");
        }
    }
})();
