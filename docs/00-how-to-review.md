# How to review this

| Step | Review | Look for |
| --- | --- | --- |
| 1 | [Demonstration](../README.md#demonstration) | Can a team leader see what is short, and act on it? |
| 2 | [Iteration plan](01-iteration-plan.md) | The first slice, and what comes later |
| 3 | [Specification](02-slice-spec.md) | Requirements, acceptance criteria, assumptions and exclusions |
| 4 | [Technical design](03-technical-design.md), [decision records](adr/README.md) | Architecture, data model and trade-offs |
| 5 | [Test strategy](04-test-strategy.md), [how to run the tests](../README.md#run-the-tests) | How each criterion and risk is tested |
| 6 | [Workflow](../.github/workflows/ci-cd.yml), [CI/CD runs](https://github.com/ChrisWu365/chris-exercise/actions) | Checks, tests and a successful deployment |
| 7 | [Agentic coding approach](05-agentic-coding-approach.md), [agent instructions](../AGENTS.md), [agent log](agent-log.md) | How the agents were guided and corrected |
| 8 | [Known limitations](../README.md#known-limitations) | What would need to change for production |

## Follow one action through the code

When a team leader clicks "Check":

1. [`package-list.tsx`](../src/components/package-list.tsx) sends the ticked packages.
2. [`run-check.ts`](../src/app/actions/run-check.ts) is the server action that receives them.
3. [`perform-check.ts`](../src/data/perform-check.ts) validates them, and handles failures.
4. [`check-inputs.ts`](../src/data/check-inputs.ts) reads the data from Supabase.
5. [`check.ts`](../src/domain/check.ts) calculates the result, using [`quantity.ts`](../src/domain/quantity.ts) for exact decimals.
6. [`results-dialog.tsx`](../src/components/results-dialog.tsx) shows it, and [`csv.ts`](../src/domain/csv.ts) builds the export in the browser.
