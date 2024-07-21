# shows commit time

# for current commit (default)
git show -s --format=%cI #Example: "2024-07-21T11:34:04+05:30"
# git show -s --format=%cr #Example: "30 minutes ago"
# git show -s --format=%cD #Example: "Sun, 21 Jul 2024 11:34:04 +0530"
# git show -s --format=%cd #Example: "Sun Jul 21 11:34:04 2024 +0530"
# git show -s --format=%ct #Example: "1721541844"
# git show -s --format=%ci #Example: "2024-07-21 11:34:04 +0530"

# for specific commit
# git show -s --format=%cI [<commit>]