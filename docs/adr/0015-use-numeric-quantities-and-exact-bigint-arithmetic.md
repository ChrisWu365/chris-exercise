# 15. Use numeric quantities and exact BigInt arithmetic

Date: 2026-11-05

## Status

Accepted

## Context

Quantities can be decimals. JavaScript numbers can't represent many decimals exactly: 0.1 + 0.2 gives 0.30000000000000004, which would report a false shortage against stock of 0.3. A wrong status could mislead a team leader's decision.

## Decision

Quantities will be `numeric(12,3)` in the database and read as text. In `src/domain` they will be held as `BigInt` counts of thousandths for all arithmetic and comparison, and converted back to decimal strings for display and export.

## Consequences

- Results are exact, with no new dependency.
- Every read must cast quantities to text, and the SAMPLE JSON must store them as strings. A value read as a JavaScript number could lose precision without any error.
- Three decimal places is a fixed limit. Changing it needs a migration and a change to the conversion.
- A decimal library was rejected as an unneeded dependency for adding, multiplying and comparing.
