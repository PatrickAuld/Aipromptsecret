# E2E tests (Playwright)

This repo includes a minimal Playwright suite to validate core flows against a **non-production** Supabase project.

## Running locally

```bash
pnpm install

# Required (use a dedicated test Supabase project!)
export SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...

pnpm e2e
```

## What it tests

- Adds and approves a message (writes `messages` + `moderation_actions`)
- Adds and denies a message (writes `messages` + `moderation_actions`)

## Safety

These tests use the **service role** key and will modify the database. Do not point them at production.
