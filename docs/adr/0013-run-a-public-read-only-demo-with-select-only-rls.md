# 13. Run a public read-only demo with select-only RLS

Date: 2026-11-05

## Status

Accepted

Supersedes [ADR-0007](0007-use-the-anon-key-with-rls-on-the-server.md) and [ADR-0010](0010-run-a-public-demo-with-a-public-reset.md).

## Context

The brief needs a publicly accessible experience that reviewers can try. The app no longer writes anything, so a public reset has no purpose. Supabase's `service_role` key bypasses Row Level Security (RLS), so a defect in an app using it could change any table.

## Decision

The demo will have no sign-in and no reset. The running app will use only the anon key, held in a server-side environment variable with no `NEXT_PUBLIC_` prefix. Every table will have RLS enabled, with select-only policies and no write policies. The `service_role` key will be used only by the local seed script, and won't be stored in Vercel or GitHub.

## Consequences

- The database itself keeps all data read-only for the app, whatever the app code does, and one visitor can't change anything for another.
- If the anon key leaked, it could read only the SAMPLE data the demo already shows.
- RLS policies need their own tests.
- Production must add real sign-in, roles and tenant-scoped policies.
