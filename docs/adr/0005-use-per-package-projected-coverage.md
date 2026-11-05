# 5. Use per-package projected coverage

Date: 2026-11-05

## Status

Superseded by ADR-0012

## Context

Team leaders need to know whether recorded stock appears to cover planned work. Several packages can need the same limited stock. The iteration plan places stock allocation across packages in iteration 3, and the specification defines no priority between packages.

## Decision

We will compare each package separately with all recorded stock, as a read-only projection. We won't apply a priority rule, reserve stock, or change inventory. "Soonest first" is display order only.

## Consequences

- The result is simple to explain and matches the specification.
- Two packages can both show `Looks ready` while relying on the same stock. The UI states that stock isn't reserved, and the specification records this as a known limitation.
- The UI must avoid words such as "allocated", "held" and "reserved" for calculated figures.
- A projection across packages would need a documented priority rule, a tie-break, a rule for how `Unknown` quantities affect later packages, and a specification change.
