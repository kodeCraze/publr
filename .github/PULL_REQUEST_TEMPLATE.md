## Summary

Describe the change in a few sentences.

## What Changed

-

## Why

-

## Testing

- [ ] Husky hooks passed locally
- [ ] Manually tested locally
- [ ] Not applicable

Notes:

- `pre-commit` runs `pnpm lint-staged` to format staged files
- `pre-push` runs `pnpm build` on a clean `HEAD`

## Env / Infra Impact

- [ ] No env changes
- [ ] Client env changed
- [ ] Worker env changed
- [ ] DB env changed
- [ ] Cloudflare config changed
- [ ] Backblaze config changed

Details:

-

## Screenshots Or Recording

Attach screenshots or a short recording if the UI changed.

## Checklist

- [ ] I updated docs if setup, env, or deployment behavior changed
- [ ] I did not commit secrets, `.env`, or `.dev.vars`
- [ ] I called out any follow-up work still needed
