# Team Standards (DRAFT)

> This is a draft. Teammates: comment on anything you want to change.

## 1. Branches

- Never commit directly to `main`. Work on a branch and open a PR.
- Name: `feature/<task-number>-<short-name>`, for example `feature/0.6-rbac-middleware`.
- Use `fix/<short-name>` for bug fixes.
- Related tasks can share one branch. Unrelated work gets a new branch.

## 2. Commits

- Format: `type(scope): short message`
- Types: `feat` (new thing), `fix` (bug), `refactor` (clean up, same behavior), `docs` (text only).
- Example: `feat(0.6): add RBAC middleware and permissions map`
- One commit = one clear change.