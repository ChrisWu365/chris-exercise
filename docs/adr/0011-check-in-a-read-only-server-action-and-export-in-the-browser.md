# 11. Check in a read-only server action and export in the browser

Date: 2026-11-05

## Status

Accepted

Supersedes [ADR-0003](0003-use-server-components-and-server-actions.md) and [ADR-0009](0009-store-escalation-issues-as-jsonb.md).

## Context

The slice no longer records anything. A team leader ticks packages, clicks "Check", reads a result in a dialog and exports it as a CSV snapshot to share outside the system. Recording the outcome inside the app had limited business value in this slice and didn't form a closed loop. This web UI is the only consumer.

## Decision

We will render the dashboard with Next.js server components and run the check in one read-only server action, so the browser never contacts Supabase. The browser will build the CSV from the result it already holds, with no server request and nothing stored. The slice will have no public REST API, and pages will render dynamically without caching.

## Consequences

- There is little client code, and queries stay on the server.
- The file always matches the dialog, and can be exported after the connection is lost.
- The JSONB issues column and its production limits no longer apply.
- The system has no record that a result was exported or shared, and the CSV can be edited, so it isn't an audit record. Iteration 2 closes this loop.
- There is no API ready for the mobile app. One would be added if a second consumer appears.
