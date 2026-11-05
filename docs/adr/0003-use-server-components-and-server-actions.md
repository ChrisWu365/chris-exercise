# 3. Use server components and server actions

Date: 2026-11-05

## Status

Superseded by ADR-0011

## Context

The slice has a package list, a package detail, and two writes: recording an escalation and resetting the demo. This web UI is the only consumer. Database credentials and business rules must stay off the browser.

## Decision

We will render pages with Next.js server components, and handle the two writes with server actions. The browser will never contact Supabase, and the slice will have no public REST API. Pages will render dynamically without caching.

## Consequences

- There is little client code, and credentials and rules stay on the server.
- An escalation or reset appears after a reload, and failed requests are never served as stale success.
- There is no API ready for the mobile app or other consumers. One would be added if a second consumer appears.
