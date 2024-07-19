import { resolve } from "path";
import { isGitRepo } from "../src/helpers/is-git-repo";

(async () => {
    // console.log(await isGitRepo(resolve("~/")));
    console.log(await isGitRepo(resolve("./")));
    console.log(await isGitRepo(resolve("./test")));
})();
