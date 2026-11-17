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
## 3. Backend code rules (`backend/`)

- `routes/`: only URLs. Each route lists its middleware and its controller. No logic here.
- `controllers/`: the logic of each action (signup, create supplier, etc.).
- `middleware/`: checks that run before a controller (`authenticate`, `authorize`).
- `config/`: settings, for example the roles and permissions map.
- `db.js`: the only place that creates the Prisma client. Import it, don't create another.
- File names: `<name>Controller.js`, `<name>Routes.js`.
- Every protected route uses `authenticate` first, then `authorize('<action>')`.

## 4. Database rules

- Change the database only through Prisma migrations. Never edit the DB by hand.
- Never edit a migration that was already merged. Make a new one.
- A new table needs GRANTs for `app_user` in its migration.
- Never commit `.env` or passwords.

## 5. Frontend code rules (`frontend/src/`)

- `app/`: pages. One folder = one URL.
- `components/`: reusable pieces. Reuse an existing component before making a new one.
- `lib/`: helpers, like `api.ts` for calls to the API. Pages don't call the API directly.
## 6. PR review checklist (for the reviewer)

Before you approve, check:

- [ ] The PR is linked to a task, and the Summary says what changed.
- [ ] CI is green (lint, type-check, test, build).
- [ ] The PR does one thing. No unrelated files (for example local config changes).
- [ ] No `.env`, passwords or secrets in the files.
- [ ] No leftover debug code (`console.log`, commented-out code).
- [ ] Backend: new routes use `authenticate` and `authorize`.
- [ ] Database: a new migration is added, not an edited old one, and it has GRANTs for `app_user`.
- [ ] Frontend: existing components are reused.
- [ ] "How was this tested?" is filled in and makes sense.
- [ ] You understand the change. If not, ask a question before approving.
