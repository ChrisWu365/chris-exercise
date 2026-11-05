# 4. Calculate readiness on read in a pure module

Date: 2026-11-05

## Status

Superseded by ADR-0012

## Context

The specification requires one server-side implementation of deterministic, unit-tested readiness rules. The list is paginated, and the server returns only the requested page. Team leaders are told that stock was checked only for packages on the current page, and the list shows no totals by status.

## Decision

We will implement the rules as pure TypeScript in `src/domain`, with no framework or database imports. We will calculate readiness when a page is requested, for the packages on that page only, and won't store statuses.

## Consequences

- The rules are fast to test, easy to explain, and portable.
- Status always matches current data, with nothing to keep in sync.
- Each request makes several queries, though only for one page of packages.
- A shortage on a later page stays unseen until that page is opened, which the UI discloses.
- SQL functions were rejected because they would be harder to test and tied to the database.
