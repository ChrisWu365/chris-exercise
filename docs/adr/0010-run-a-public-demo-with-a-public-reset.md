# 10. Run a public demo with a public reset

Date: 2026-11-05

## Status

Superseded by ADR-0013

## Context

The brief needs a publicly accessible experience that reviewers can try. Only fictional data is stored, so sign-in adds little to the slice's decision. With one escalation per package, the escalation flow can't be repeated once every package has been escalated.

## Decision

The demo will have no sign-in and will act as one fictional team leader. Any visitor can record an escalation, read every note, or use a "Reset demo" action that deletes all escalations and nothing else. The UI will state this. The anon role gets `DELETE` on `escalation` only for this purpose.

## Consequences

- Reviewers can try and rerun the flow immediately, which is the demo's convenience.
- Anyone can change or remove records at any time, so one visitor can wipe another's escalations. This is the demo's shortage.
- Notes can contain unwanted text until a reset, so the form warns against real details.
- Rate limiting isn't needed, because the table can never hold more than one record per seeded package, each with a note of up to 500 characters.
- Production must add real sign-in and remove both the reset and its `DELETE` permission, because escalations must be kept as an audit record.
