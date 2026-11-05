# 7. Use the anon key with RLS on the server

Date: 2026-11-05

## Status

Accepted

## Context

The app must not be able to change stock, and public clients must not be able to change sample data. Supabase's service-role key bypasses Row Level Security (RLS), so a defect in an app using it could change any table.

## Decision

The running app will use only the anon key, held in a server-side environment variable with no `NEXT_PUBLIC_` prefix. Every table will have RLS enabled. The anon role can only `SELECT` the catalogue and sample tables, and can `SELECT`, `INSERT` and `DELETE` on `escalation`. The service-role key will be used only for seeding.

## Consequences

- The database itself keeps stock read-only for the app, whatever the app code does.
- If the anon key leaked, it could read and delete only what the public demo already allows, and still couldn't change stock. It could, however, insert escalations with made-up issues by skipping the server's calculation.
- RLS policies need their own tests.
- Real sign-in, roles and tenant-scoped policies are still needed for production.
