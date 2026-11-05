# Architecture Decision Records

This folder records the significant architecture decisions for this project, using [Michael Nygard's format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions): title, status, context, decision and consequences.

The [technical design](../03-technical-design.md) describes the system as it is now. These records explain why it took that shape.

| ADR | Decision | Status |
| --- | --- | --- |
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](0002-build-a-standalone-nextjs-app-for-the-exercise.md) | Build a standalone Next.js app for the exercise | Accepted |
| [0003](0003-use-server-components-and-server-actions.md) | Use server components and server actions | Accepted |
| [0004](0004-calculate-readiness-on-read-in-a-pure-module.md) | Calculate readiness on read in a pure module | Accepted |
| [0005](0005-use-per-package-projected-coverage.md) | Use per-package projected coverage | Accepted |
| [0006](0006-manage-the-database-schema-with-migrations.md) | Manage the database schema with migrations | Accepted |
| [0007](0007-use-the-anon-key-with-rls-on-the-server.md) | Use the anon key with RLS on the server | Accepted |
| [0008](0008-seed-sample-data-into-separate-tables.md) | Seed sample data into separate tables | Accepted |
| [0009](0009-store-escalation-issues-as-jsonb.md) | Store escalation issues as JSONB | Accepted |
| [0010](0010-run-a-public-demo-with-a-public-reset.md) | Run a public demo with a public reset | Accepted |

## Adding a record

1. Copy the structure of an existing record, using the next number.
2. Add it to the table above.
3. Never rewrite the decision in an accepted record. To change a decision, add a new record and set the old record's status to `Superseded by ADR-NNNN`.
