# 14. Seed Supabase from the CSV and SAMPLE JSON

Date: 2026-11-05

## Status

Superseded by ADR-0017

Supersedes [ADR-0008](0008-seed-sample-data-into-separate-tables.md).

## Context

The supplied CSV is a solutions catalogue with no products, quantities, inventory, packages or schedules, so these must be clearly labelled SAMPLE data. Deployed code must read from Supabase, not bundled files. The `Unknown` status has been removed, so stored data should be complete. The one exception is a planned installation whose code isn't in the catalogue, which is shown with blank details and a warning.

## Decision

Runtime data will live in the Supabase tables `solutions`, `products`, `solution_products`, `work_packages`, `planned_installations` and `stock`. All except `solutions` hold SAMPLE data. Files will be seed sources only: the CSV and one JSON file under `data/sample/`.

An idempotent seed script, run locally against the online Supabase project, will validate them and write to Supabase. Invalid input aborts without writing. Constraints will enforce completeness: `NOT NULL`, foreign keys, positive quantities, `quantity_on_hand >= 0` and one stock row per product. The only link without a foreign key is `planned_installations.internal_code`. `service_type` can be empty, because 16 supplied rows hold the word `Blank`.

## Consequences

- Invalid data is stopped at the boundary, so the calculation handles fewer cases.
- The database won't catch a mistyped solution code. The blank row and warning show it instead. Production could add the foreign key if planning records are chosen from the catalogue.
- New data isn't deployed automatically; the owner runs the seed script. The writes aren't one transaction, so a lost connection part-way needs a rerun.
- Real sources can replace the SAMPLE tables without changing the check rules.
- Text IDs are for SAMPLE data only. Production should use `bigint` or `uuid` keys, since long text keys can slow joins and indexes at volume.
