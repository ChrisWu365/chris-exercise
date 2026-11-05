# Architecture Decision Records

This folder records the significant architecture decisions for this project, using [Michael Nygard's format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions): title, status, context, decision and consequences.

The [technical design](../03-technical-design.md) describes the system as it is now. These records explain why it took that shape.

| ADR | Decision | Status |
| --- | --- | --- |
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](0002-build-a-standalone-nextjs-app-for-the-exercise.md) | Build a standalone Next.js app for the exercise | Accepted |
| [0003](0003-use-server-components-and-server-actions.md) | Use server components and server actions | Superseded by ADR-0011 |
| [0004](0004-calculate-readiness-on-read-in-a-pure-module.md) | Calculate readiness on read in a pure module | Superseded by ADR-0012 |
| [0005](0005-use-per-package-projected-coverage.md) | Use per-package projected coverage | Superseded by ADR-0012 |
| [0006](0006-manage-the-database-schema-with-migrations.md) | Manage the database schema with migrations | Accepted |
| [0007](0007-use-the-anon-key-with-rls-on-the-server.md) | Use the anon key with RLS on the server | Superseded by ADR-0013 |
| [0008](0008-seed-sample-data-into-separate-tables.md) | Seed sample data into separate tables | Superseded by ADR-0014 |
| [0009](0009-store-escalation-issues-as-jsonb.md) | Store escalation issues as JSONB | Superseded by ADR-0011 |
| [0010](0010-run-a-public-demo-with-a-public-reset.md) | Run a public demo with a public reset | Superseded by ADR-0013 |
| [0011](0011-check-in-a-read-only-server-action-and-export-in-the-browser.md) | Check in a read-only server action and export in the browser | Accepted |
| [0012](0012-calculate-a-combined-projection-when-check-is-clicked.md) | Calculate a combined projection when Check is clicked | Accepted |
| [0013](0013-run-a-public-read-only-demo-with-select-only-rls.md) | Run a public read-only demo with select-only RLS | Accepted |
| [0014](0014-seed-supabase-from-the-csv-and-sample-json.md) | Seed Supabase from the CSV and SAMPLE JSON | Superseded by ADR-0017 |
| [0015](0015-use-numeric-quantities-and-exact-bigint-arithmetic.md) | Use numeric quantities and exact BigInt arithmetic | Accepted |
| [0016](0016-use-separate-supabase-projects-for-local-and-production.md) | Use separate Supabase projects for local and production | Accepted |
| [0017](0017-keep-solution-code-consistency-in-code-rather-than-foreign-keys.md) | Keep solution code consistency in code rather than foreign keys | Accepted |

## Adding a record

1. Copy the structure of an existing record, using the next number.
2. Add it to the table above.
3. Never rewrite the decision in an accepted record. To change a decision, add a new record and set the old record's status to `Superseded by ADR-NNNN`.
