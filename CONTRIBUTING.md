# Contributing To Publr

Thanks for helping improve Publr.

## Development Workflow

1. Fork and clone the repo.
2. Install dependencies with `pnpm install`.
3. Set up the three env files documented in `README.md`.
4. Push the schema with `pnpm db:push`.
5. Start the app with `pnpm dev` or run the client and worker separately.

## Branching

- Create a focused branch for each change.
- Keep PRs narrow when possible.
- Do not commit secrets, `.env` files, or `.dev.vars`.

## Before Opening A PR

- Husky formats staged files on `pre-commit`
- Husky runs a clean `pnpm build` on `pre-push`
- Update docs if setup, env vars, or deployment steps changed
- Add screenshots or short screen recordings for UI changes

## PR Checklist

- Explain what changed
- Explain why it changed
- Mention any env or migration impact
- Mention any follow-up work still left

## Areas Where Contributions Help Most

- Platform publishing reliability
- Queue handling and retry behavior
- OAuth onboarding improvements
- Media validation and upload UX
- Documentation and deployment guides

## Coding Notes

- The repo is a `pnpm` workspace
- `apps/publr-client` is the Next.js app
- `apps/publr-worker` is the Cloudflare Worker
- `packages/db` holds the shared Drizzle schema

## Questions

If you are unsure about a change, open an issue or draft PR with your proposed direction.
