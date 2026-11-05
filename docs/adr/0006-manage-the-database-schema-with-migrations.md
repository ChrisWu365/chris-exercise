# 6. Manage the database schema with migrations

Date: 2026-11-05

## Status

Accepted

## Context

The database has constraints and Row Level Security (RLS) policies that the app relies on for correctness and security. Changes made by hand through a dashboard can't be reviewed and can differ between local, CI and production environments.

## Decision

We will use a migration-based, Database as Code approach. Tables, constraints, indexes and RLS policies will change only through versioned SQL files in `supabase/migrations`, applied with the Supabase CLI. Applied files won't be edited; mistakes will be corrected with a new migration. Catalogue and sample data will stay in a separate seed script.

## Consequences

- The schema is repeatable, reviewed with the code that depends on it, and the same in every environment.
- CI can rebuild a database from empty, and fail if the hosted schema has drifted from the migrations.
- Even a small schema change needs a file and a pipeline run.
- Each migration must stay compatible with the app version that is running.
