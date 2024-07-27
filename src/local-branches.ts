import { readdir, readFile, stat } from "fs/promises";
import { resolve } from "path";
import { assertGitRepo } from "./helpers/assert-git-repo";

interface Branch {
    name: string;
    pointsAt: string;
}

async function getBranchPointer(parentFolder: string, branchName: string) {
    const pointer = await readFile(resolve(parentFolder, branchName));
    return pointer.toString().replace("\n", "");
}

async function collectBranches(heads: string, parentPath: string) {
    const dirItems = await readdir(resolve(heads, parentPath));

    let branches: Array<Branch> | undefined;

    for (let index = 0; index < dirItems.length; index++) {
        const dirItem = dirItems[index];

        const _stat = await stat(resolve(heads, parentPath, dirItem));

        if (_stat.isDirectory() === true) {
            const nestedBranches = await collectBranches(
                heads,
                `${parentPath}${dirItem}/`
            );

            if (nestedBranches !== undefined) {
                if (branches === undefined) {
                    branches = [...nestedBranches];
                } else {
                    branches = [...branches, ...nestedBranches];
                }
            }
        }
        if (_stat.isFile() === true) {
            if (_stat.size === 41) {
                const branch: Branch = {
                    name: `${parentPath}${dirItem}`,
                    pointsAt: await getBranchPointer(
                        resolve(heads, parentPath),
                        dirItem
                    ),
                };

                if (branches === undefined) {
                    branches = [branch];
                } else {
                    branches = [...branches, branch];
                }
            }
        }
    }

    return branches;
}

export async function localBranches(repoPath: string) {
    await assertGitRepo(repoPath);

    let heads = resolve(repoPath, "./.git/refs/heads");

    return await collectBranches(heads, "");
}
