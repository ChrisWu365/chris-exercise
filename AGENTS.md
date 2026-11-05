# Project instructions

## Purpose

This repository contains a take-home exercise for a material readiness
experience for construction team leaders. Keep the first slice focused on
checking planned work packages, identifying material issues, and recording
an escalation.

## Source material and decisions

- Read the assignment brief and supplied CSV when relevant to a task.
- The brief defines the exercise requirements. The CSV is a solutions
  catalogue; it is not a stock system or a source of material quantities.
- Follow the reviewed slice specification and technical design. If they
  conflict or leave a decision that changes user-visible behaviour open,
  report the issue instead of silently inventing a rule.
- Keep product assumptions and demo data clearly labelled.

## Domain rules

- Missing or invalid stock data is `Unknown`; a valid stock quantity of
  zero is a real stock value.
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
- Add tests for changed behaviour and report the checks actually run.
- Do not add dependencies unless needed; explain why they are needed.
- Do not commit, push, deploy, or open a pull request unless the user
  explicitly asks.
- Record material agent corrections and decisions in the existing
  `agent-log.md`; keep the log concise and factual.