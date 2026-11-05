# 2. Build a standalone Next.js app for the exercise

Date: 2026-11-05

## Status

Accepted

## Context

The current stack is React, Node.js, Flutter, Next.js, Supabase and Vercel. The slice could be a new service on that stack, which the team already knows, or a feature in the existing web app. The existing web app's code isn't available for this exercise, and the brief needs a public URL. Team leaders do this check before going on site, with a connection, so offline use isn't needed in this slice.

## Decision

We will build this slice as a standalone Next.js app on Supabase and Vercel, with no Flutter work.

For production, we recommend adding it as a feature in the existing web app, unless a separate team or release cycle justifies a separate service. This recommendation needs validating against that app's code.

## Consequences

- The exercise can be built, deployed and reviewed independently, with no departures from the stack.
- Keeping the rules free of framework and database code makes them portable to either production option.
- A production feature could reuse existing sign-in, tenants and real records, but would have to follow that app's conventions and release cycle.
- A production service would need shared sign-in and access to project and stock data, which couples it to the existing database or requires an API.
- If team leaders prove to need this check on site, the mobile app will need an API and a display of when data was last synced.
