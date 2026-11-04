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
