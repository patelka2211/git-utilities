import { readdir, readFile, stat } from "fs/promises";
import { resolve } from "path";
import { isGitRepo } from "./helpers/is-git-repo";
import { affirmativeResponse } from "./helpers/responses";

interface Branch {
    name: string;
    pointsAt: string;
}

async function getBranchPointer(
    parentFolder: string,
    branchName: string
): Promise<string | undefined> {
    try {
        const pointer = await readFile(resolve(parentFolder, branchName));
        return pointer.toString().replace("\n", "");
    } catch (error) {
        // Error reading content of a file.
    }
}

async function collectBranches(
    heads: string,
    parentPath: string,
    abbreviatedHash: boolean
): Promise<Branch[] | undefined> {
    try {
        const dirItems = await readdir(resolve(heads, parentPath));

        let branches: Array<Branch> | undefined;

        for (let index = 0; index < dirItems.length; index++) {
            try {
                const dirItem = dirItems[index],
                    _stat = await stat(resolve(heads, parentPath, dirItem));

                // For a directory
                if (_stat.isDirectory() === true) {
                    const nestedBranches = await collectBranches(
                        heads,
                        `${parentPath}${dirItem}/`,
                        abbreviatedHash
                    );

                    if (nestedBranches !== undefined) {
                        if (branches === undefined) {
                            branches = [...nestedBranches];
                        } else {
                            branches = [...branches, ...nestedBranches];
                        }
                    }
                }
                // For a file
                else if (_stat.isFile() === true) {
                    if (_stat.size === 41) {
                        const pointsAt = await getBranchPointer(
                            resolve(heads, parentPath),
                            dirItem
                        );

                        if (pointsAt !== undefined) {
                            const branch: Branch = {
                                name: `${parentPath}${dirItem}`,
                                pointsAt:
                                    abbreviatedHash === true
                                        ? pointsAt.substring(0, 7)
                                        : pointsAt,
                            };

                            if (branches === undefined) {
                                branches = [branch];
                            } else {
                                branches = [...branches, branch];
                            }
                        }
                    }
                }
            } catch (error) {
                // Error reading stats of a file or a directory.
            }
        }

        return branches;
    } catch (error) {
        // Error reading content of a directory.
    }
}

interface Options {
    /**
     * Default value: `true`
     */
    abbreviatedHash?: boolean;
}

export async function localBranches(
    repoPath: string,
    options?: Options
): Promise<
    | { type: "ERROR"; msg: "Not a Git repository."; data?: undefined }
    | { type: "SUCCESS"; data: Branch[] | undefined; msg?: undefined }
> {
    const isItRepo = await isGitRepo(repoPath);

    if (isItRepo.type === "ERROR") return isItRepo;

    if (options === undefined) options = {};
    if (options.abbreviatedHash === undefined) options.abbreviatedHash = true;

    return affirmativeResponse(
        await collectBranches(
            resolve(repoPath, ".git/refs/heads"),
            "",
            options.abbreviatedHash
        )
    );
}
