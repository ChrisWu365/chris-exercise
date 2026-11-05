# 12. Calculate a combined projection when Check is clicked

Date: 2026-11-05

## Status

Accepted

Supersedes [ADR-0004](0004-calculate-readiness-on-read-in-a-pure-module.md) and [ADR-0005](0005-use-per-package-projected-coverage.md).

## Context

Team leaders often work on several packages at once, so a per-package check has little business value. Statuses don't appear on the dashboard, and a team leader is assumed to have few enough packages to load them all without pagination.

## Decision

We will implement the rules as pure TypeScript in `src/domain`, with no framework or database imports, and won't store results. When "Check" is clicked, each product's required quantity will be totalled across the ticked packages and compared once with current recorded stock, as a read-only projection. We won't apply a priority rule, reserve stock or change inventory.

## Consequences

- The rules are fast to test, easy to explain and portable, and results always match current data.
- The rows for the ticked packages must be fetched first, and the database doesn't check the results. SQL functions were rejected because they would be harder to test and tied to the database.
- The result doesn't show which package would go without, and it ignores unticked packages that may need the same stock. The UI states that stock isn't reserved, and the specification records both limits.
- The UI must avoid words such as "allocated", "held" and "reserved" for calculated figures.
- Pagination can be added if the assumption about package numbers proves wrong.
