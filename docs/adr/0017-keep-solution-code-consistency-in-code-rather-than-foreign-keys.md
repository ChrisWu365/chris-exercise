# 17. Keep solution code consistency in code rather than foreign keys

Date: 2026-11-06

## Status

Accepted

Supersedes [ADR-0014](0014-seed-supabase-from-the-csv-and-sample-json.md).

## Context

The supplied CSV is a solutions catalogue with no products, quantities, inventory, packages or schedules, so these must be clearly labelled SAMPLE data. Deployed code must read from Supabase, not bundled files. Stored data should be complete, except that a planned solution code may be missing from the catalogue. A team leader should still be able to find that code's products, but a foreign key from `solution_products` to `solutions` would prevent it from having any. A supplier may also be removed from the business, which shouldn't affect existing `planned_installations` and `solution_products` data. Foreign key checks also add cost to writes under high concurrency.

## Decision

Runtime data will live in the Supabase tables `solutions`, `products`, `solution_products`, `work_packages`, `planned_installations` and `stock`. All except `solutions` hold SAMPLE data. Files will be seed sources only: the CSV and one JSON file under `data/sample/`.

An idempotent seed script, run locally, will validate them and write to Supabase. Invalid input aborts without writing. Constraints will enforce completeness: `NOT NULL`, positive quantities, `quantity_on_hand >= 0`, one stock row per product, and foreign keys on `work_package_id` and `product_id`.

`internal_code` in `planned_installations` and `solution_products` will have no foreign key to `solutions`. Code will keep those links consistent, which in this slice means the seed script. `service_type` can be empty, because 16 supplied rows hold the word `Blank`.

## Consequences

- Removing a supplier's solutions leaves existing planned installations and solution products in place.
- A code missing from the catalogue shows blank details, and its mapped products still count towards demand. A warning appears only if it has no mapped products.
- The database won't catch a mistyped solution code. The seed script can only report a likely one, because it looks the same as a code from a removed supplier. A production write path would need its own checks.
- This slice gains no speed, because the app doesn't write. The performance benefit applies only to a future high-concurrency write path, and should be measured there.
- New data isn't deployed automatically; the owner runs the seed script. The writes aren't one transaction, so a lost connection part-way needs a rerun.
- Real sources can replace the SAMPLE tables without changing the check rules.
- Text IDs are for SAMPLE data only. Production should use `bigint` or `uuid` keys, since long text keys can slow joins and indexes at volume.
