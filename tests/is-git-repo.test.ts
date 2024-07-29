import { resolve } from "path";
import { isGitRepo } from "../src/helpers/is-git-repo";

(async () => {
    for await (const item of ["./", "./test"]) {
        const { type } = await isGitRepo(resolve(item));

        if (type === "ERROR") {
            console.log(`"${resolve(item)}"`, "is not a Git repo.");
        } else {
            console.log(`"${resolve(item)}"`, "is a Git repo.");
        }
    }
})();
