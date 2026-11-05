# My agentic coding approach

## Tools

I used claude code to help me with planning, documentation, coding and debugging.

I also used other AI agents like ChatGPT and Gemini to help me review the output of claude code.

## How I planned and directed the work

1. I put exercise brief file under /docs/brief folder and /data/source, I created a /docs/01-iteration-plan.md file and wrote 4 iterations according to my understanding of the business discussed in the brief file.
2. I wrote slice Summary in the /docs/02-slice-spec.md file, and then I directed claude code to read these 4 files and write the slice specs according to the requirement of the exercise.
3. After we finished slice spec. I created AGENTS.md and CLAUDE.md, added rules around 100 lines, for persistent guiderail, to let agent automatically read the rules at the start of each session.
4. Then I let claude code write /docs/03-technical-design.md and /docs/04-test-strategy.md, and save architecture design changes in /docs/adr folder.

Throughout the work:

- I asked claude code to stop and ask when information is not enough.
- Let claude code plan before acting and ask for approval if there are open questions.
- I tried to give claude code industry best practice and examples, so that it can follow.
- I let claude code to split tasks into small groups, so the code generated should be around 300 lines at most per commit, which is easier to review.

## How I reviewed and verified outputs

- I reviewed what claude code produced and raised any mistakes or let it explain why.
- I also used other AI agents like ChatGPT and Gemini to help me review the output of claude code.
- I let claude code write /docs/agent-log.md to record all the chats between us, including when I corrected or rejected it, and affected files.

## Examples of where you corrected or rejected an agent's suggestion

They are recorded at the beginning of /docs/agent-log.md, which contains more examples summarized by claude code automatically.

## Corrections and rejections

### 2026-11-04: Unrequested date and stock-age rules in the readiness check
- **Task:** Specify the first slice, which lets team leaders check before going on site whether upcoming work packages have the materials they need, so they can plan crews.
- **Agent suggested:** Two rules of its own: list only packages starting within 14 days, to focus on near-term crew planning; and mark stock as `Unknown` if last counted over 7 days ago, to avoid relying on old figures.
- **Decision:** Rejected both. The agent then reviewed its other additions against the brief and the iteration plan, and the user approved its proposed cuts, including a shared-stock warning, a copyable summary and a demo reset.
- **Reason:** Neither rule came from the brief or plan. The user saw unnecessary complexity and limits and asked whether they added business value; the agent could not show that they did, and the slice must stay small and focused.

### 2026-11-04: Pagination of the team leader's package list
- **Task:** Decide how team leaders view their upcoming work packages when looking for material problems, once the 14-day filter was removed.
- **Agent suggested:** One complete list of all sample packages, soonest first.
- **Decision:** Changed. The user required pagination; the spec now has the server return one page at a time, with 10 packages per page (a size the agent chose).
- **Reason:** It avoids loading too many packages to the frontend and lets team leaders access as many packages as they want.

### 2026-11-04: Readiness totals versus a current-page statement
- **Task:** Make the paginated list clear to team leaders, because a package with a shortage can sit on a later page and be missed.
- **Agent suggested:** Totals above the list, such as "3 short, 2 unknown across 24 packages", so problems show without paging; this means checking every package on each view. The agent offered it as a question and recommended against it.
- **Decision:** Rejected. The list instead states that stock has been checked only for the packages on the current page.
- **Reason:** The statement makes the function clear to team leaders. The user gave no separate reason for rejecting the totals.

### 2026-11-04: Hiring company's name in project documents
- **Task:** Describe in the spec what production would need beyond the demo, such as real project and stock records and user sign-in.
- **Agent suggested:** Naming the hiring company in those production requirements.
- **Decision:** Rejected. The name was replaced with "the existing platform" and is not to be used anywhere in this project.
- **Reason:** To keep privacy.

### 2026-11-04: Agent log entries without business context
- **Task:** Record corrections so that readers can see how the agent was directed, as the brief requires.
- **Agent suggested:** Short entries that named each rule or feature without explaining its purpose.
- **Decision:** Changed. The entries were rewritten to state the team leader's need and what each suggestion was for.
- **Reason:** The entries were too simple and lacked business objectives, which left readers unsure what they referred to.

### 2026-11-05: How the slice fits the existing stack and apps
- **Task:** Explain in the technical design how the team leader experience fits the current stack, existing web app and offline-first mobile app.
- **Agent suggested:** A short paragraph treating the screens as a possible route in the existing web app, with Flutter simply not used.
- **Decision:** Changed, after the user approved the agent's plan: the design now compares a new service on the same stack with a feature in the existing web app, and covers the mobile app.
- **Reason:** The brief asks for the stack and both apps to be taken into account; the same stack gives better team familiarity.

### 2026-11-05: Clarity of the interfaces and data model
- **Task:** Describe the technical design's interfaces and data relationships so a reviewer can follow how package demand reaches stock.
- **Agent suggested:** A `fromPage` input on the package detail interface, and a diagram without `catalogue_solution` or the link between planned scenarios and solution materials.
- **Decision:** Changed, after the user approved the agent's plan: `fromPage` is gone (browser history returns to the list page), and the diagram now shows all seven tables and every relationship.
- **Reason:** The frontend already knows the page, and the relationship between each data model must be complete and clear.

### 2026-11-05: Ambiguous wording and the meaning of `Unknown`
- **Task:** Make the technical design understandable to reviewers, and the `Unknown` status useful to team leaders.
- **Agent suggested:** Undefined terms such as "invalid count or quantity", compressed production requirements, and `Unknown` reasons without examples or next steps.
- **Decision:** Changed, after the user approved the agent's plan: terms and valid values are defined, the sentences are rewritten, and each `Unknown` cause now has a message and next step.
- **Reason:** Ambiguous information must be easy for reviewers to understand, and the app should help users rather than confuse them.

### 2026-11-05: Database changes managed as code
- **Task:** Define how the slice's database schema is created and changed across environments.
- **Agent suggested:** A migrations folder and a CI step to apply migrations, without stating the approach or its rules.
- **Decision:** Changed, after the user approved the agent's plan: the design now has a Database as Code section, with migrations as the only way to change the schema and CI checks for drift.
- **Reason:** The user gave no separate reason.

### 2026-11-05: Demo decisions listed as open decisions
- **Task:** Separate what is decided for the public demo from what must be discussed for real projects.
- **Agent suggested:** Six open decisions, after earlier proposing removal of the demo reset, which the user approved at the time.
- **Decision:** OD-1 and OD-2 are the current design. OD-3 becomes a simple public reset in the spec. For the demo: OD-4 uses server time, OD-5 treats zero as `Unknown`, OD-6 shows notes to all visitors with the existing warning. OD-4 to OD-6 stay open for real projects.
- **Reason:** The logic may change later but is the current design; anyone being able to escalate or reset at any time is both the convenience and the shortage of a public demo.

### 2026-11-05: Sample ID types and JSONB limits for production
- **Task:** Make the design's data model honest about what would not carry over from the demo to real projects.
- **Agent suggested:** Text IDs on sample tables and JSONB `issues`, with only "harder to report on" noted as a cost.
- **Decision:** Changed. The design now says text IDs are for sample data only (production uses `bigint` or `uuid`) and records the cost of searching inside JSONB.
- **Reason:** Text IDs may affect query performance on real projects, and JSONB may perform poorly when searching contained issue substrings in production.
