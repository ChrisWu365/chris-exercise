# First-slice specification: material readiness dashboard

## Table of contents

1. [Summary](#1-summary)
2. [Data](#2-data)
3. [Functional requirements](#3-functional-requirements)
4. [Acceptance criteria](#4-acceptance-criteria)
5. [Non-functional requirements](#5-non-functional-requirements)
6. [Capability decisions](#6-capability-decisions)
7. [Assumptions to validate](#7-assumptions-to-validate)
8. [Exclusions and known limitations](#8-exclusions-and-known-limitations)

## 1. Summary

**Slice:** A material readiness dashboard where team leaders check upcoming work packages for material shortages or missing information, then record an escalation for the relevant stakeholders.

**Users:** Team leaders preparing upcoming site work. Stakeholders who receive escalations are not users of this slice; they get their own view in iteration 2.

**Decision supported:** "Can this crew go ahead as planned, or do I need to raise a material issue first?"

**Value:** Team leaders can see whether materials appear to be available, identify shortages or unknown information, and escalate them for stock checking and replenishment. This helps them plan crews and reduces the risk of an avoidable trip.

**Boundary:** This slice reports what the data shows and records an escalation. It does not reserve stock, order materials, notify anyone, or recommend or approve alternative solutions.

## 2. Data

### Supplied catalogue

`data/source/solutions-excerpt.csv` has 148 Ryanfire solutions. `Internal Code` and `Supplier Ref. Code` are each unique across all rows.

| Finding | Consequence for this slice |
| --- | --- |
| The brief says the file includes required products, but it has **no product column**. `Service Type` is the penetrating service (for example, a copper pipe), not the fire stopping material. | The solution-to-product mapping is sample data. Materials are never inferred from catalogue fields. |
| 11 groups of solutions share the same orientation, substrate option, service type option, size, integrity and insulation. | Catalogue attributes cannot identify a solution. Each planned scenario names its solution by `Internal Code`. |
| `Internal Code` has leading zeros (`0334`). | Codes are stored and compared as text. |
| `Service Size` uses mixed formats (`Ø100mm`, `900mm x 50mm`, `60`). `Insulation` is `-` on 8 rows. 6 `Substrate` values end in a comma. | Values are displayed as supplied and never used in calculations. `-` is not interpreted as a rating. |

### Sample data

All of this is invented for the demo and is labelled as sample data in the UI and in the data files.

| Sample data | Fields and assumptions |
| --- | --- |
| Team leader | One fictional team leader, who owns all the packages and is named on escalations. |
| Work package | Name, site, start date, crew, and planned scenarios (`Internal Code` and installation count). |
| Solution materials | `Internal Code`, product, and quantity per installation. |
| Product | ID, fictional name (such as "Sample Sealant A"), and stock unit. These names and mappings do not describe real Ryanfire specifications. |
| Stock | Product and quantity on hand. There is one stock pool per product. |
| Escalation group | "Procurement (sample)" receives all escalations. |

Sample start dates are set relative to the current date in Auckland, so packages stay upcoming. The sample data has more packages than fit on one page, and includes at least one package in each FR-3 state, each `Unknown` cause in FR-10, and a package with no planned scenarios.

## 3. Functional requirements

### Readiness

**FR-1 Package list.** Show upcoming packages, soonest first, 10 per page. Each row shows the name, site, start date, crew, readiness status and number of issues. The team leader can move between pages and sees the total number of packages. The server returns only the requested page, so every package stays reachable however many exist. The list states that stock has been checked only for the packages on the current page, and that other pages are checked when opened.

**FR-2 Product line calculation.** For each product in a package, required quantity = the sum of (installation count × quantity per installation) across the package's scenarios. Each line gets one status:

| Status | Rule |
| --- | --- |
| `Unknown` | Required quantity or stock cannot be established, because the solution code is not in the catalogue, no materials are mapped to the solution, or an installation count, quantity per installation or stock figure is not valid. |
| `Short` | Required quantity is greater than quantity on hand. Show the shortfall. |
| `Available` | Required quantity is less than or equal to quantity on hand. |

`Unknown` is checked first. Missing stock is never treated as zero, and a recorded stock of zero is `Short`. Values are valid as follows:

| Value | Valid | Not valid, so `Unknown` |
| --- | --- | --- |
| Installation count, quantity per installation | Whole number of 1 or more | Blank, 0, negative, decimal or not a number |
| Stock on hand | Whole number of 0 or more | No record, blank, negative, decimal or not a number |

**FR-3 Package status.** The first matching rule applies:

1. `Short`: any line is `Short`.
2. `Unknown`: any line is `Unknown`, or the package has no planned scenarios.
3. `Looks ready`: at least one line exists and every line is `Available`.

An issue is a `Short` or `Unknown` line, or a solution with no mapped materials. A `Short` package also shows its count of `Unknown` issues, so a fix for the shortage isn't mistaken for full readiness. A package with no planned scenarios has no issues, so it can't be escalated; FR-10 explains this on screen.

**FR-4 Package detail.** Show each scenario's catalogue details (internal and supplier codes, orientation, substrate, service type, size, integrity and insulation) and installation count. Show each product line's required quantity, quantity on hand, shortfall, status and, for `Unknown`, its cause and next step (FR-10).

**FR-5 Data labels.** Keep a visible notice that packages, material mappings and stock are sample data. Tell the user that `Looks ready` means stock appears sufficient for this package on the recorded figures, that stock isn't reserved, and that this is not a compliance statement. Also tell the user that this is a public demo, so anyone can record an escalation or reset the demo at any time, and records may change or disappear.

### Escalation

**FR-6 Record an escalation.** From the detail of a package with issues, the team leader can record one escalation with an optional note of up to 500 characters. It covers all the package's current issues. A package with no issues has no escalation action.

**FR-7 Escalation record.** The server recalculates the issues when saving, then stores the package, the team leader, the escalation group, the time, the note, and each issue's status, reason, required quantity, stock and shortfall. A package has at most one escalation; a repeat submission creates no new record and returns the existing one.

**FR-8 Show the outcome.** After saving, and after a reload, the package list and detail show that the package was escalated, when and to which group. The detail also shows the note, which every visitor can see, so the form warns users not to enter personal or real project details. The confirmation says the issue has been recorded but no one has been notified automatically. Escalating does not change readiness status.

### Failure states

**FR-9 Failure and empty states.**
- If data cannot load, show an error with a retry. Never show an empty list or `Looks ready` in its place.
- If there are no packages, say so. If a requested page doesn't exist, say so and link to the first page.
- If saving fails, keep the note, show the error, allow a retry, and do not show the package as escalated.

### Understanding `Unknown`

**FR-10 Explain `Unknown` and suggest a next step.** `Unknown` means: "We can't tell yet, because some information is missing. This doesn't mean the material is out of stock. Don't rely on it until it's confirmed." The status never appears alone. The list shows it with what needs attention, such as "Unknown: 2 items need checking" or "Unknown: no planned work added". The detail shows this definition and each cause with its next step:

| Cause | What the user sees | Next step shown |
| --- | --- | --- |
| No valid stock figure | "No stock figure is recorded for Sample Sealant A." | Escalate so stock can be checked. |
| Solution code not in catalogue | "Solution 9999 isn't in the catalogue, so its materials can't be worked out." | Check the code with whoever planned this package. |
| No materials mapped | "No materials are listed for solution 0334." | Escalate so the materials can be confirmed. |
| Installation count not valid | "The installation count for solution 0334 is missing or isn't valid." | Check the count with whoever planned this package. |
| Quantity per installation not valid | "The quantity of Sample Sealant A per installation is missing or isn't valid." | Escalate so the quantity can be confirmed. |
| No planned scenarios | "No planned work has been added to this package, so there are no materials to check." | Check with whoever planned this package. |

Once a package has been escalated, the screen shows the escalation instead of suggesting it again.

### Demo reset

**FR-11 Reset the demo.** The package list has a "Reset demo" action. After the user confirms, it deletes all escalations and changes nothing else, so packages, stock and the catalogue stay as seeded. If it fails, the page shows an error and nothing changes. Any visitor can use it at any time. This is convenient for reviewers, but one visitor can remove another's escalations.

## 4. Acceptance criteria

Each criterion should map to at least one automated test in the test strategy.

**Calculation**
- **AC-1** Given 10 installations at 2 units and 5 at 1 unit of the same product, with stock of 20, the line shows required 25, shortfall 5, `Short`.
- **AC-2** Required 25 with stock of 25 is `Available`; with stock of 24 it is `Short` with a shortfall of 1.
- **AC-3** A stock record of 0 is `Short`. No stock record is `Unknown`, and the detail states the cause and next step.
- **AC-4** A scenario with an unknown code, no material mapping, or a count or quantity that is not valid makes the affected line or package `Unknown`, and never `Looks ready`.
- **AC-16** A count or quantity that is blank, 0, negative, decimal or not a number is `Unknown`, as is a stock figure that is blank, negative, decimal or not a number. Boundary values are valid: a count or quantity of 1, and stock of 0.
- **AC-5** A package with one `Short` and one `Unknown` line shows `Short` and the `Unknown` count. A package with `Available` and `Unknown` lines shows `Unknown`. A package with no scenarios shows `Unknown`. A package whose lines are all `Available` shows `Looks ready`.

**Dashboard**
- **AC-6** With 12 packages, page 1 returns the 10 soonest and page 2 returns the other 2, with a total of 12. Packages sharing a start date keep a stable order, so none is repeated or skipped between pages.
- **AC-20** Start dates and escalation times are shown in Auckland time, including when the server's UTC date differs from the Auckland date.
- **AC-7** Opening a package and going back returns to the same page. Requesting a page that doesn't exist shows a message and a link to the first page. Every page of the list shows the statement that stock has been checked only for the packages on that page, and shows no totals by readiness status.
- **AC-8** Every catalogue value shown matches the CSV exactly, including `0334` with its leading zero and `-` for insulation.
- **AC-9** The import loads 148 solutions and fails with a clear error if a row has a missing or duplicate `Internal Code`.
- **AC-10** The sample-data notice and the `Looks ready` caveat are visible on the dashboard and package detail, on phone and desktop widths. No screen suggests an alternative solution or says a substitution is suitable.
- **AC-17** Every `Unknown` status on the list says what needs attention. The detail shows the FR-10 definition, and each cause shows its FR-10 message and next step. A package with no planned scenarios shows its message and no escalation action. An escalated package shows its escalation instead of suggesting one.

**Escalation**
- **AC-11** Escalating a package with a note creates one record with the FR-7 fields, and the escalated state and note are still shown after a reload, including to another visitor.
- **AC-12** Submitting twice, including concurrently, creates one record.
- **AC-13** The server rejects a submission with a clear message if the note exceeds 500 characters, the package does not exist, or the package has no issues. HTML in a note is displayed as plain text.
- **AC-14** The confirmation states that nobody was notified, the package status is unchanged, and a package with no issues has no escalation action.

**Demo reset**
- **AC-18** Confirming a reset removes all escalations and leaves packages, stock and catalogue unchanged, and each package with issues can then be escalated again. Cancelling changes nothing. A failed reset shows an error and removes nothing.
- **AC-19** The list and package detail state that anyone can record an escalation or reset the demo at any time.

**Failures**
- **AC-15** When a data request fails, an error and retry appear and no readiness status is shown. When a save fails, the note is kept and the package does not appear as escalated.

## 5. Non-functional requirements

| Area | Requirement |
| --- | --- |
| Correctness | Readiness logic is deterministic, has one server-side implementation and has unit tests. When data is missing, it gives `Unknown` rather than `Looks ready`. |
| Scalability | List requests return one page, and readiness is calculated only for the packages on that page. |
| Usability | The main flow works on phone and desktop. A team leader can see which packages on a page need attention without opening each one. |
| Accessibility | Status is conveyed by text as well as colour, and the main flow works by keyboard. |
| Security | Input is validated on the server and output is escaped. Database credentials stay on the server, and public clients can't change sample packages or stock. The only public writes are recording an escalation and deleting escalations through the demo reset. |
| Privacy | Only fictional people and sample data are stored. Notes are visible to every visitor, so the UI warns users not to enter personal or real project details. |
| Diagnostics | Save and load failures are visible to the user and logged on the server, without note content. |
| Maintainability | Catalogue and sample data are kept separate, so real stock or package sources can replace the samples without changing the readiness rules. |

## 6. Capability decisions

The technical design covers how each of these is implemented.

| Capability | Deployed exercise | Production would need |
| --- | --- | --- |
| Persistence | Escalations are persisted until a demo reset. Catalogue and sample data are seeded. | Real project, solution and stock records from the existing platform, with tenant separation. |
| Authentication | None. The public demo acts as one fictional team leader. | The existing platform's sign-in, role-based access and attributable audit history. |
| Demo reset | Any visitor can delete all escalations. | Remove the reset and its delete permission. Escalations must be kept as an audit record. |
| Stock | Sample balances, shown as recorded. | A trusted stock source with defined ownership, and likely location and delivery data. |
| Material mapping | Sample mapping of solutions to products. | A verified mapping and quantity basis from specification owners. |
| Notifications | None. The confirmation says so. | Email or IM delivery and stakeholder views (iteration 2). |
| Offline use | Not supported. The app requires a connection and shows an error without one. | Validate whether the check must also work on site, and if so, how it fits the Flutter app's offline model. |

## 7. Assumptions to validate

1. Team leaders do this check before going on site, with a connection, rather than from the site itself.
2. Packages name their nominated solutions, so a team leader does not choose solutions in this slice.
3. Each solution has a known quantity of each product per installation. Quantities are whole stock units; pack sizes, part-used stock and wastage are ignored.
4. All stock in one pool can reach any site.
5. A single procurement group can receive every escalation. The real routing may vary by project, product or region.
6. For the demo, the current date is the date in Auckland, where the demo will be presented, a count or quantity of zero is `Unknown`, and notes are visible to all visitors. Real projects need to revisit all three.

## 8. Exclusions and known limitations

| Excluded | Planned for |
| --- | --- |
| Notifications, stakeholder dashboard, replenishment tracking, delivery dates, and closing or re-raising an escalation | Iteration 2 |
| Detecting stock conflicts between packages, and stock allocation or reservation | Iteration 3 |
| Suggesting, submitting or approving alternative solutions. A catalogue match or higher rating does not establish suitability or compliance, which can depend on the project and consent. | Iteration 4 |
| Filtering or searching packages, crew scheduling, rescheduling packages, creating or editing packages, stock or mappings, ordering, supplier or ERP integrations, multiple suppliers, multi-location stock, and changes to the existing web or mobile apps | Not planned yet |

**Known limitations:**
- **Stock conflicts:** each package is checked separately against all recorded stock, so two packages can both show `Looks ready` while relying on the same stock.
- **Stock accuracy:** figures are taken as recorded, so out-of-date stock can look sufficient.
- **Escalation reach:** an escalation is only stored in the app until iteration 2, so the team leader must still contact people directly.
- **Public demo:** with no sign-in, anyone can record an escalation, read every note or reset the demo at any time. Reviewers can try the flow immediately, but one visitor can change or remove what another has recorded.
- **Current page only:** stock is checked only for the packages on the current page, and the list says so. The list is ordered by date, so a package with a shortage can sit on a later page until the team leader opens that page.
