# 16. Use separate Supabase projects for local and production

Date: 2026-11-05

## Status

Accepted

## Context

ADR-0014 has the seed script run locally against an online Supabase project. There are two online projects: one for the local environment and one for production. The public demo must read from Supabase, and reviewers should see stable data.

## Decision

Local development will read the local project, and the deployed app will read the production project. The seed script will run from the owner's machine and must be told which project to target. Each project's `service_role` key will be kept in its own git-ignored file, which Next.js doesn't load. The owner will apply migrations to the local project, and CI will apply them to the production project.

## Consequences

- Local work can't change the data reviewers see.
- Migrations and seeding must be applied to both projects, so the two can differ until that is done. CI's drift check covers the production project only.
- Naming the target each time reduces the risk of seeding production by mistake.
- Neither `service_role` key is stored in CI or Vercel.
