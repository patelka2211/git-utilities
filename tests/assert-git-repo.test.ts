import { resolve } from "path";
import { assertGitRepo } from "../src/helpers/assert-git-repo";

(async () => {
    console.log(await assertGitRepo(resolve("./")));
    console.log(await assertGitRepo(resolve("./test")));
})();
