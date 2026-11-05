# 1. Record architecture decisions

Date: 2026-11-05

## Status

Accepted

## Context

The brief asks for key design decisions and trade-offs to be explained and defended in a walkthrough. The technical design describes the current system, but it doesn't keep a lasting record of why each decision was made or when one changes.

## Decision

We will record architecturally significant decisions in `docs/adr`, using Michael Nygard's format: title, status, context, decision and consequences. Product rules for the demo, such as how a zero quantity is treated, stay in the specification and technical design.

## Consequences

- Reviewers can see why each decision was made and what it costs.
- Later iterations can replace a decision with a new record, which keeps the history visible.
- Each significant decision needs a short extra document, which must stay consistent with the technical design.
