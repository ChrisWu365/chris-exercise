# 9. Store escalation issues as JSONB

Date: 2026-11-05

## Status

Superseded by ADR-0011

## Context

An escalation must save the figures for each issue at that moment. A package has at most one escalation, even with concurrent submissions. This slice only displays the saved issues and never searches them.

## Decision

We will store the issues in a JSONB column on the `escalation` row, with a `UNIQUE (package_id)` constraint.

## Consequences

- Saving is a single atomic insert, with little schema.
- The constraint enforces one escalation per package, and the app turns a duplicate into the existing record.
- Searching for text inside issues would be slow at production volume, because standard JSONB indexes help with exact matches rather than substrings.
- Production should move issues to a separate table with proper columns before adding search or reporting.
