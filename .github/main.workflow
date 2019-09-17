workflow "Lint PR title on check init" {
  on = "check_suite.requested"
  resolves = "VALIDATE_PR_TITLE"
}

workflow "Lint PR title on check rerun" {
  on = "check_run.rerequested"
  resolves = "VALIDATE_PR_TITLE"
}

action "VALIDATE_PR_TITLE" {
  uses = "coleHafner/pr-title-linter@master"
  secrets = ["GITHUB_TOKEN"]
}
