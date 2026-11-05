# Project instructions

## Purpose

This repository contains a take-home exercise for a material readiness
experience for construction team leaders. Keep the first slice focused on
checking planned work packages, identifying material shortages, and support exporting details.

## Source material and decisions

- Read the assignment brief and supplied CSV when relevant to a task.
- The brief defines the exercise requirements. The CSV is a solutions
  catalogue; it is not a stock system or a source of material quantities.
- Follow the reviewed slice specification and technical design. If they
  conflict or leave a decision that changes user-visible behaviour open,
  report the issue instead of silently inventing a rule.
- Keep product assumptions and demo data clearly labelled.

## Domain rules

- Missing or invalid stock data is rejected when seeding, so it never reaches
  the check; a valid stock quantity of zero is a real stock value.
- Do not use an `Unknown` status. If a planned installation's code is not in
  the catalogue, leave its details blank and still count its mapped products.
  Every planned installation must have mapped products.
- Do not invent a stock freshness cutoff. Show a source timestamp if one is
  available; only use a freshness threshold if it is agreed and documented.
- Do not treat a catalogue match or a higher-rated product as proof that an
  alternative is suitable or compliant.
- Do not imply stock is reserved unless the system actually reserves it.
  If the approved design calculates coverage across packages by start date,
  describe it as a projection and follow the documented priority rule.
- Do not describe material readiness as full site readiness.

## Engineering

- Inspect the existing repository and follow its established structure,
  dependency versions, and coding conventions.
- Use the stated React, Next.js, Node.js, Supabase, and Vercel stack where it
  fits the existing project. Explain any departure in the technical design.
- Keep material readiness rules testable and separate from UI and database
  code where the design allows.
- Validate data at system boundaries. Do not expose server credentials to
  browser code.
- If Supabase is used, enable and review Row Level Security for exposed
  tables.
- Keep the experience usable on phone and desktop, with status conveyed by
  text as well as colour.

## Working practice

- Keep changes within the approved slice and design. For a broader change,
  explain the impact and propose a plan before proceeding.
- Read the relevant records in `docs/adr` before changing architecture, and
  follow accepted decisions. If a task conflicts with one, report the conflict
  instead of working around it.
- When a change involves a significant architecture decision, such as one
  affecting the system's structure, data model, security, or deployment, or one
  that is hard to reverse, propose a new record in `docs/adr` using Michael
  Nygard's format: title, status, context, decision, and consequences. Add it
  to the index in `docs/adr/README.md`, and keep the technical design
  consistent with it.
- Do not rewrite the decision in an accepted record. To change a decision, add
  a new record and set the old record's status to `Superseded by ADR-NNNN`.
- Keep product rules for the demo in the specification and technical design,
  not in architecture decision records.
- Add tests for changed behaviour and report the checks actually run.
- Do not add dependencies unless needed; explain why they are needed.
- Do not commit, push, deploy, or open a pull request unless the user
  explicitly asks.
- Record material agent corrections and decisions in the existing
  `agent-log.md`; keep the log concise and factual.

## Acceptance criteria

- Give every acceptance criterion an ID (AC-01, AC-02, ...) and write it
  in Given / When / Then form.
- Use concrete SAMPLE values. Verify one behaviour per criterion.
- "Then" must state an observable result: text on screen, values in a
  table, or content of an exported file.
- Do not name functions, tables, or components in a criterion.
- Use the same terms in specification, code, and database.

## Tests and verification

- For each criterion, write the test first, include the criterion ID in
  the test name, run it, show that it fails, and stop for review before
  implementing.
- Never modify, skip, or delete a test, or weaken an assertion, to make
  a check pass. Never change a criterion to match the code. If either
  seems wrong, stop and explain.
- Work on one criterion or a small related group per task. Keep each
  change under about 300 lines, excluding generated files; otherwise
  propose a split first.
- When a task is done, report in this order: files changed, criteria
  covered, checks run and their results, decisions you made that the
  specification does not state, open questions.