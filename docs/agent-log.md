# Agent log

This log tracks how the coding agent (Claude Code) was directed and corrected during the exercise. It records the user's prompts, the files the agent read, and each correction or rejection. It does not record the agent's system prompt or its full replies. The user checks each correction entry.

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

### 2026-11-05: What "unenforced" means for `internal_code`
- **Task:** Explain how solution codes missing from the catalogue are stored and reported as `Unknown`.
- **Agent suggested:** Calling the `internal_code` links "not enforced" without separating them from the catalogue's primary key or covering repeated missing codes.
- **Decision:** Changed. The design separates the enforced primary key from the absent foreign key, and defines handling of several entries with the same missing code.
- **Reason:** The user asked how a primary key can be unenforced and how more than one entry with a missing code is handled.

### 2026-11-05: Time zone for the demo's current date
- **Task:** Set the date used for sample start dates and displayed times.
- **Agent suggested:** Server time, typically UTC, as the user had approved, with displayed dates possibly a day off local time.
- **Decision:** Changed to Auckland time for the demo; the time zone remains an open decision for real projects.
- **Reason:** The demo will be presented in Auckland.

## Prompts and files read

Prompts are verbatim.

### Prompt 1 (2026-11-04)
> please write a concise specification for the chosen first slice of my take-home exercise. Read the applicable CLAUDE.md/AGENTS.md instructions, the assignment PDF, the supplied CSV, and my iteration plan first. Treat the PDF as the assignment requirements and the CSV as a solutions catalogue. update only `docs/02-slice-spec.md`, do not write code

The prompt text was sent twice in the same message.

**Files read:** `CLAUDE.md`, `AGENTS.md` (empty), `README.md`, `docs/brief/take-home-brief.pdf`, `docs/01-iteration-plan.md`, `docs/02-slice-spec.md`, `data/source/solutions-excerpt.csv`

### Prompt 2 (2026-11-04)
> why do you give ungiven requirements like 'Show the team leader's packages starting within the next 14 days' and 'stock count more than 7 days old', I think I introduce unnecessary complexity and limits to the system, does it add bussiness values? if not, please check and remove logics like these. Remember to keep the first slice focus as mentioned in the brief pdf file. Just design a useful small slice with clear reasoning. Please review your slice spec and tell me what you should do and how should you do it.

**Files read:** None. The agent reviewed the content it had already read and written.

### Prompt 3 (2026-11-04)
> Sounds good. And I think it is better to pagenate the sample packages displayed, to avoid loading too many packages to the frontend, and it makes it possible for team leads to access as many packages as they want.

**Files read:** None. `docs/02-slice-spec.md` was rewritten and then searched for leftover terms.

### Prompt 4 (2026-11-04)
> No, don't add the counts for every package, but we need to declare that it matches the stock with packages on the current page only, which make its funtion clear to the team leaders. And please remove and don't use the company name in this project to keep privacy.

**Files read:** None opened directly. The agent searched all repository files for the company name, and checked tracked files, commit history and the remote with Git.

### Prompt 5 (2026-11-04)
> Looks good now. Please create docs/agent-log.md file to keep track of our chats according to the requirement of the exercise. When I correct or reject your output, append to docs/agent-log.md:
> date, task, what you suggested, my decision and reason. Max 5 lines
> per entry. I will check each entry.
> Record my prompts and the files you read. Do not claim to record
> your own system prompt.

**Files read:** None.

### Prompt 6 (2026-11-04)
> Entry like 14-day and 7-day rules is too simple, lack of business objectives, which makes readers confuse what they are, please check and refine

**Files read:** None. The agent edited `docs/agent-log.md` from the content it had already written.

### Prompt 7 (2026-11-04)
> commit now. Use conventional commit format, one concern per commit

**Files read:** None opened directly. The agent checked the working tree and searched tracked files for the company name with Git.

### Prompt 8 (2026-11-04)
> The first-slice specification has been reviewed and committed. And I have added Project instructions in the AGENTS.md file. Now write `docs/03-technical-design.md` based on the reviewed `docs/02-slice-spec.md`, the iteration plan, the assignment brief, the supplied CSV, and the existing repository. Do not write application code or change other files. The design must distinguish projected stock coverage from actual stock reservation. Projected coverage is a calculation based on the current inventory values and the approved package-priority rule; it must not change inventory or imply that stock is locked. Use the package-priority and readiness rules from the approved specification. Do not invent a stock-freshness threshold. The supplied CSV does not contain inventory or material quantities. Explain how clearly labelled sample data supports the deployed exercise and what real inventory source production would need. Cover the user flow, data model, components and interfaces, where the business rules live, fit with the existing repository and stack, security, failure handling, deployment and CI/CD, and the main trade-offs. Keep the design proportional to this slice. If the specification does not define a required behavior, list it as an open decision instead of silently choosing one.

This log was not updated during that task because the prompt said not to change other files.

**Files read:** `AGENTS.md`, `docs/02-slice-spec.md`, `docs/01-iteration-plan.md`, `docs/agent-log.md`, `.gitignore`. The brief and CSV were not reopened; the agent relied on its earlier read of them. It also checked repository state and searched tracked files with Git.

### Prompt 9 (2026-11-05)
> As a reviewer, I find some issues with /docs/03-technical-design.md: 1. The current stack is React, Node.js, Flutter, Next.js, Supabase and Vercel. Take this stack, the existing web app and the offl ine-first mobile app into account in your design. I think maybe there are two situations: one: it is a brand new microservice project using the same current stack for better team work familiarity. two: it can also be a new feature added to code of an existing web app project. Did you consider these in your design? 2. In the Interfaces section 'fromPage' is already known by the frontend, why do you need to pass it to the API? 3. I can only see the catalogue_solution table in the Data model diagram, and I don't see the relationship between sample_planned_scenario and sample_solution_material, make sure that the relationship/mapping between each data model is complete and clear. 4. what is invalid count or quantity, did you give clear definition of it? please check and make sure that ambiguous information like this is clearly defined and easy to understand by reviewers. 5. what does it mean by 'Product IDs that match a verified solution-to-material mapping owned by specification owners.' and 'A named owner for accuracy, read access for the platform, and tenant separation.'? please make sure the sentences make sense to a reviewer. 6. I think 'Unknown' is ambiguous information for users, please make sure that it is clearly defined with proper examples and make it as actionable for users as possible, as we are helping the users instead of making them confused. 7. please apply migrate-based approach / Database as Code design in this project. 8. for OD-1 and OD-2, I think it is the current design, not a open decisions, even though we might change the logic in the future. for OD-3, please add a reset feature to the docs/02-slice-spec.md, and keep it simple, and do note that as the demo is public, so anyone can do the escalation or reset at anytime, which is the convenience and also shortage of this demo. for OD-4, accept server time for the demo. for OD-5, treat zero as Unknown for the demo. for OD-6, display notes to all visitors with the existing warning for the demo. So, I only see OD-4, OD-5 and OD-6 as Open decisions, which should be discussed and redesign for real projects in the future. please review my issue, give your opinion and make the changes after approval from me.

**Files read:** None. The agent reviewed the content it had already read and written.

### Prompt 10 (2026-11-05)
> yes, approved.

**Files read:** None. The agent edited `docs/02-slice-spec.md`, `docs/03-technical-design.md` and `docs/agent-log.md` from content it had already read, and checked the Mermaid diagrams with a parser in a temporary folder.

### Prompt 11 (2026-11-05)
> 1. for '6. Data model', the data type of id field in table sample tables like sample_work_package are text, instead of using bigint or uuid, which may affect query performance for real projects. Please note that they are sample data type only, should change accordingly for production. 2. for '14. Main trade-offs', please note that the data type of issues field in table escalation is jsonb, which may have performance issue when trying to search by the contained issue substrings for production in the future. internal_code is primary key of table catalogue_solution, how can it be Unenforced, how do you handle more than one entries with code missing from the catalogue. 3. for 'Open decisions for real projects', please change "Current date" to Auckland Time as the demo will be presented in Auckland. 4. please add Table of Contents for docs/02-slice-spec.md and docs/03-technical-design.md

**Files read:** None opened directly. The agent edited `docs/02-slice-spec.md`, `docs/03-technical-design.md` and `docs/agent-log.md`, then checked the table of contents links and diagrams with a script in a temporary folder.

### Prompt 12 (2026-11-05)
> please create /docs/adr folder to keep track of Architecture Decision Record in michael nygard adr structure.

**Files read:** None. The agent wrote the records from `docs/03-technical-design.md` and `docs/01-iteration-plan.md` as already read, then checked the links and searched for the company name.

### Prompt 13 (2026-11-05)
> commit now. Use conventional commit format, one concern per commit

**Files read:** None opened directly. The agent checked the working tree and searched the changed files for the company name with Git.
