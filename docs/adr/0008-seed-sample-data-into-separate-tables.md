# 8. Seed sample data into separate tables

Date: 2026-11-05

## Status

Superseded by ADR-0014

## Context

The supplied CSV is a solutions catalogue. It has no products, material quantities, inventory, packages or schedules, so these must be clearly labelled sample data. The demo must also show every `Unknown` cause, including a solution code that isn't in the catalogue and blank values.

## Decision

We will seed sample data into Postgres tables prefixed `sample_`, separate from `catalogue_solution`. Only `src/data` will know about them. The sample tables will have:
- No foreign key from `internal_code` to the catalogue's primary key.
- Nullable counts, quantities and stock figures.
- Text IDs, such as `pkg-03`, so that the sample data stays readable.

## Consequences

- The demo follows a realistic path through Postgres, and every `Unknown` cause can be shown.
- Real sources can replace the sample tables without changing the readiness rules.
- The database won't catch a mistyped solution code, so the readiness rules must. Production could add the foreign key if planning records are chosen from the catalogue.
- Text IDs are for sample data only. Production should use `bigint` or `uuid` keys, since long text keys can slow joins and indexes at volume.
- The demo needs a hosted database. In-memory sample data was rejected because it wouldn't persist escalations.
