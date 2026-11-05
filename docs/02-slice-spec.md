# First-slice specification: material readiness dashboard

## Table of contents

1. [Summary](#1-summary)
2. [Data model](#2-data-model)
3. [Functional requirements](#3-functional-requirements)
4. [Acceptance criteria](#4-acceptance-criteria)
5. [Non-functional requirements](#5-non-functional-requirements)
6. [Capability decisions](#6-capability-decisions)
7. [Assumptions to validate](#7-assumptions-to-validate)
8. [Exclusions and known limitations](#8-exclusions-and-known-limitations)

## 1. Summary

**Slice:** As a Team Leader, 
I want to check material shortages for the selected planned work packages before going on site in a planned work packages dashboard, see the material shortage details and export the result as a CSV snapshot to keep as a record or to share with stakeholders outside the system, 
So that I can identify the material shortages, notify stakeholders, and reschedule crews.

**Users:** Team leaders preparing for planned site work packages. Stakeholders who receive a CSV snapshot are not users of this slice; they get their own view in iteration 2.

**Decision supported:** "Can this crew go ahead as planned, or do I need to notify other stakeholders of the shortages?"

**Value:** Team leaders can see whether materials appear to be available, identify shortages and notify other stakeholders. This helps them plan crews, reduces the risk of an avoidable trip and notify other stakeholders early.

**Boundary:** This slice supports material shortages check against the current stock, shows the shortage details and exports the result as a CSV snapshot. It does not reserve stock, order materials, notify anyone from within the system, reschedule crews, or recommend or approve alternative solutions. The team leader notifies stakeholders and reschedules crews outside the system.

## 2. Data model

### Where data lives

The runtime store is Supabase, and deployed code reads only from Supabase, never from bundled files. Files are seed sources only: `data/source/solutions-excerpt.csv`, and one JSON file of SAMPLE data under `data/sample/`.

| Table | Holds | Key columns and constraints |
| --- | --- | --- |
| `solutions` | All 148 rows from the CSV, with cleaned values plus raw values | `internal_code` text primary key; `supplier_ref_code` unique; the other cleaned CSV columns; `raw_row` holding the CSV row as supplied. All `NOT NULL` except `service_type` |
| `products` | SAMPLE | `id` primary key; `name` and `unit`, `NOT NULL` |
| `solution_products` | SAMPLE | Primary key (`internal_code`, `product_id`); `product_id` foreign key; `internal_code` text with no foreign key; `quantity_per_installation` `numeric(12,3)`, `NOT NULL`, greater than 0 |
| `work_packages` | SAMPLE | `id` primary key; `name`, `site`, `crew` and `start_offset_days`, `NOT NULL` |
| `planned_installations` | SAMPLE | `id` primary key; `work_package_id` foreign key; `internal_code` text with no foreign key; `installation_count` integer, greater than 0. All `NOT NULL` |
| `stock` | SAMPLE | `product_id` primary and foreign key, so one stock row per product; `quantity_on_hand` `numeric(12,3)`, `NOT NULL`, 0 or more |

- **Missing catalogue match:** `internal_code` has no foreign key to `solutions` in `planned_installations` or `solution_products`, so a code such as `9998` can be stored without a catalogue row. Removing a supplier's solutions from `solutions` therefore doesn't affect existing planned installations or solution products; their catalogue details just become blank (FR-4).
- **Planned installations always have products:** every planned installation must have at least one mapped product. `internal_code` isn't unique in `solution_products`, so a foreign key can't enforce this, and the seed script checks it instead.
- **Sample IDs:** text IDs keep the SAMPLE data readable. Production should use `bigint` or `uuid` keys.
- **Start dates:** a start date is the current date in Auckland plus `start_offset_days`, so packages stay in the future without reseeding.

### Supplied catalogue

The CSV has 148 Ryanfire solutions. `Internal Code` and `Supplier Ref. Code` are each unique across all rows.

| Finding | Consequence for this slice |
| --- | --- |
| The brief says the file includes required products, but it has **no product column**. `Service Type` is the penetrating service (for example, a copper pipe), not the fire stopping material. | The solution-to-product mapping is SAMPLE data. Materials are never inferred from catalogue fields. |
| 11 groups of solutions share the same orientation, substrate option, service type option, size, integrity and insulation. | Catalogue attributes cannot identify a solution. Each planned installation names its solution by `Internal Code`. |
| `Internal Code` has leading zeros (`0334`). | Codes are stored and compared as text. |
| 15 `Service Type` values have extra spaces, and 6 `Substrate` values end in a comma (`Unlined Timber,`). | Cleaned values trim and collapse spaces and drop the trailing comma. `raw_row` keeps the original. |
| 16 `Service Type` values are the word `Blank`, which means the value is empty rather than naming a service. | The cleaned `service_type` is empty on those rows, and is shown blank. `raw_row` keeps the original. |
| `Service Size` uses mixed formats (`Ø100mm`, `900mm x 50mm`, `60`). `Insulation` is `-` on 8 rows. | Both are kept as text and never used in calculations. `-` is not interpreted as a rating. |

### Seeding

An idempotent seed script validates both seed files and then writes to Supabase. Rerunning it with the same files gives the same data. Invalid input aborts without writing. Input is invalid if:

- the CSV doesn't have 148 rows, or an `Internal Code` is missing or duplicated;
- a value breaks a table constraint above;
- a product has no stock row, a work package has no planned installations, or a planned installation has no mapped products.

A planned installation or solution product whose code isn't in the catalogue is allowed. If a `solution_products` code is in neither the catalogue nor any planned installation, the script reports it as a possible mistyped code and still writes it.

### Access

Row Level Security is enabled on every table, with select-only policies and no write policies. The app can't change any data. The `service_role` key is used only by the local seed script.

### Calculation

Aggregation and status logic run in pure TypeScript, not SQL.

| Benefit | Cost | Alternative rejected |
| --- | --- | --- |
| The rules can be unit-tested without a database, and are easy to explain and reuse. | The rows for the selected packages must be fetched first, and the database doesn't check the results. | SQL view or function: fewer rows to fetch, but harder to test and tied to the database. |

### Decimal comparison

Quantities are `numeric(12,3)` in the database, so they have at most three decimal places. To avoid floating point errors, the calculation never uses JavaScript numbers for quantities:

1. Quantities are read from the database as text.
2. Each is converted to a `BigInt` count of thousandths, so `0.1` becomes `100n`.
3. Multiplying by a whole installation count, adding, subtracting and comparing all use `BigInt`, so the results are exact.
4. For display and export, the result is converted back to a decimal with trailing zeros removed, so `300n` becomes `0.3`.

For example, 0.1 + 0.2 against stock of 0.3 is `Available`. JavaScript numbers would give 0.30000000000000004 and wrongly report `Short`.

## 3. Functional requirements

**FR-1 Package list.** Show all planned work packages, soonest first, with packages sharing a start date in a stable order. Each row shows a tick box, name, site, start date and crew. Packages are not paginated. The dashboard never shows a status; statuses appear only in the results dialog.

**FR-2 Select and check.** The team leader ticks one or more packages and clicks "Check". "Check" is disabled until at least one package is ticked. The check uses the stock recorded when the team leader clicks "Check".

**FR-3 Combined calculation.** Each product's required quantity is added up across all the selected packages, as the sum of (installation count × quantity per installation). That total is compared once with the product's quantity on hand:

| Status | Rule |
| --- | --- |
| `Short` | Required quantity is greater than quantity on hand. Show the shortfall. A recorded stock of zero is a real value. |
| `Available` | Required quantity is less than or equal to quantity on hand. No shortfall is shown. |

No priority applies between packages, because the check compares only the combined total.

**FR-4 Results dialog.** The check opens a dialog. The combined result is at the top, with each product's required quantity, quantity on hand, shortfall and status. Below it, each selected package shows its planned installations (internal code, catalogue details and installation count) and its required quantity of each product. If a planned installation's code isn't in the catalogue, its catalogue details are left blank, and its mapped products are still calculated and counted in the combined result. The combined result is ordered by the earliest start date of the selected packages needing each product, then by product name. Each package's products are ordered by product name.

**FR-5 Export.** The dialog has an "Export" button, and it is the only place to export. It builds a CSV file in the browser from the data already in the dialog, with no further server request. The file has one row for each product in each selected package, including `Available` products:

| Column | Content |
| --- | --- |
| `exported_at` | Export time in Auckland, with its UTC offset |
| `package_name`, `site`, `start_date`, `crew` | The package's details |
| `product`, `unit` | The product |
| `package_required` | This package's required quantity |
| `combined_required`, `on_hand`, `combined_shortfall`, `status` | The combined result for this product, repeated on each of its rows. `combined_shortfall` is blank when `status` is `Available` |
| `notice` | `SAMPLE DATA. Stock is not reserved. This is not a compliance statement.` |

**FR-6 Notices.** The list and dialog show that packages, material mappings and stock are SAMPLE data. The dialog also states that the result is a projection against recorded stock for the selected packages only, that stock is not reserved, that this is not a compliance statement, and that it covers materials only, not full site readiness.

**FR-7 Failure and empty states.**
- If packages can't load, show an error with a retry. Never show an empty list in its place.
- If there are no planned work packages, say so.
- If a check can't get its data because the database is unavailable, show an error with a retry, and show no result and no "Export" button.

## 4. Acceptance criteria

Each criterion maps to at least one automated test in the test strategy. Seeding and database access rules aren't team leader behaviour, so they are verified there too. AC-15, AC-23, AC-28 and AC-29 have been retired, and their IDs won't be reused.

**Package list**
- **AC-01** Given SAMPLE Package A starts in 2 days and SAMPLE Package B starts in 5 days, when the team leader opens the dashboard, then SAMPLE Package A is listed above SAMPLE Package B.
- **AC-02** Given 12 SAMPLE packages, when the team leader opens the dashboard, then all 12 are listed and no page controls are shown.
- **AC-03** Given SAMPLE Package A has been checked and the results dialog has been closed, when the team leader views the dashboard, then its row shows neither `Short` nor `Available`.
- **AC-04** Given the Auckland date is 2026-11-06 while the UTC date is 2026-11-05, when SAMPLE Package A starts in 2 days, then its start date is shown as 8 Nov 2026.
- **AC-05** Given no package is ticked, when the team leader views the dashboard, then "Check" is disabled.

**Combined result**
- **AC-06** Given SAMPLE Package A has 10 installations at 2 units and 5 at 1 unit of Sample Sealant A, and stock of 20, when it is checked, then the combined result shows required 25, on hand 20, shortfall 5 and `Short`.
- **AC-07** Given required 25 and stock of 25 of Sample Sealant A, when it is checked, then the combined result shows `Available` with no shortfall.
- **AC-08** Given required 1 and stock of 0 of Sample Sealant A, when it is checked, then the combined result shows shortfall 1 and `Short`.
- **AC-09** Given SAMPLE Package A needs 15 and SAMPLE Package B needs 10 of Sample Sealant A, and stock of 20, when both are checked, then the combined result shows required 25, shortfall 5 and `Short`.
- **AC-10** Given SAMPLE Package A needs 15 and SAMPLE Package B needs 10 of Sample Sealant A, and stock of 20, when only SAMPLE Package A is ticked and checked, then the combined result shows required 15 and `Available`.
- **AC-11** Given SAMPLE Package A needs 0.1 and SAMPLE Package B needs 0.2 of Sample Sealant A, and stock of 0.3, when both are checked, then the combined result shows required 0.3 and `Available`.

**Results dialog**
- **AC-12** Given SAMPLE Package A is checked, when the dialog opens, then the combined result appears above the package details.
- **AC-13** Given SAMPLE Package A plans solution `0334`, when the dialog opens, then that row shows `0334`, `V1.11-22SFR00038-146-E`, `Wall`, `Copper Pipe`, `Ø100mm`, integrity `60` and insulation `-`.
- **AC-14** Given SAMPLE Package A plans solution `0853`, when the dialog opens, then its substrate is shown as `Unlined Timber` with no trailing comma.
- **AC-16** Given SAMPLE Package A is checked, when the dialog opens, then it shows the text "Stock is not reserved".
- **AC-17** Given a phone-width screen, when the dialog shows a shortage of Sample Sealant A, then the word `Short` is visible and "Export" can be reached.
- **AC-31** Given SAMPLE Package A plans solution `9998`, which isn't in the catalogue, with 2 installations at 3 units of Sample Sealant A, when the dialog opens, then that row shows `9998` with its catalogue details blank and required 6 of Sample Sealant A.
- **AC-32** Given SAMPLE Package A plans solution `9998`, which isn't in the catalogue, with 2 installations at 3 units of Sample Sealant A, and 5 installations at 2 units of solution `0334`, when it is checked, then the combined result shows required 16 of Sample Sealant A.
- **AC-30** Given SAMPLE Package A plans solution `0853`, whose supplied `Service Type` is the word `Blank`, when the dialog opens, then its service type is shown blank and the word `Blank` doesn't appear.

**Export**
- **AC-18** Given the results dialog isn't open, when the team leader views the dashboard, then no "Export" button is shown.
- **AC-19** Given SAMPLE Package A needs 15 and SAMPLE Package B needs 10 of Sample Sealant A, with stock of 20, when the result is exported, then SAMPLE Package A's row has `package_required` 15, `combined_required` 25, `on_hand` 20, `combined_shortfall` 5 and `status` `Short`.
- **AC-20** Given Sample Sealant B is `Available`, when the result is exported, then the file has a row for Sample Sealant B with `status` `Available` and a blank `combined_shortfall`.
- **AC-21** Given the export happens at 9:30 am on 5 Nov 2026 in Auckland, when the file is opened, then `exported_at` is `2026-11-05T09:30:00+13:00`.
- **AC-22** Given any exported row, when the file is opened, then `notice` is `SAMPLE DATA. Stock is not reserved. This is not a compliance statement.`
- **AC-24** Given the dialog shows a result and the connection is then lost, when the team leader clicks "Export", then the file contains the values shown in the dialog.

**Failures**
- **AC-25** Given the database is unavailable, when the team leader opens the dashboard, then an error and a retry appear and no list is shown.
- **AC-26** Given no planned work packages exist, when the team leader opens the dashboard, then the message "No planned work packages" appears.
- **AC-27** Given SAMPLE Package A is ticked and the database then becomes unavailable, when the team leader clicks "Check", then an error and a retry appear, with no result and no "Export" button.

## 5. Non-functional requirements

| Area | Requirement |
| --- | --- |
| Correctness | The calculation is deterministic, has one implementation, is unit-tested, and uses exact decimal arithmetic. |
| Scalability | All planned work packages load at once, on the assumption that a team leader has few of them (assumption 1). |
| Usability | The main flow works on phone and desktop. |
| Accessibility | Status is conveyed by text as well as colour, and the main flow works by keyboard. |
| Security | The app has read-only database access. Server credentials stay out of browser code, and the `service_role` key is used only by the local seed script. Exported values can't run as spreadsheet formulas. |
| Privacy | Only fictional people and SAMPLE data are stored. |
| Diagnostics | Load and check failures are visible to the user and logged. |
| Maintainability | Catalogue and SAMPLE data are kept separate, so real stock or package sources can replace the samples without changing the calculation. |

## 6. Capability decisions

| Capability | Deployed exercise | Production would need |
| --- | --- | --- |
| Persistence | Supabase holds seeded data, and the app writes nothing. Snapshots are saved only as the team leader's own file. | Real project, solution and stock records from the existing platform, with tenant separation. |
| Authentication | None. The public demo shows the same SAMPLE packages to everyone. | The existing platform's sign-in and role-based access, so each team leader sees their own packages. |
| Stock | SAMPLE balances, shown as recorded. | A trusted stock source with defined ownership, and likely location and delivery data. |
| Material mapping | SAMPLE mapping of solutions to products. | A verified mapping and quantity basis from specification owners. |
| Notifications | None. The team leader shares the CSV outside the system if needed. | Email or IM delivery and stakeholder views (iteration 2). |
| Offline use | Not supported. The app requires a connection and shows an error without one. | Validate whether the check must also work on site, and if so, how it fits the Flutter app's offline model. |

## 7. Assumptions to validate

1. A team leader has few enough planned work packages for all of them to load at once.
2. Team leaders do this check before going on site, with a connection, rather than from the site itself.
3. Packages name their nominated solutions, so a team leader does not choose solutions in this slice.
4. Each solution has a known quantity of each product per installation. Quantities can be decimals with up to three decimal places; pack sizes and wastage are ignored.
5. All stock in one pool can reach any site.
6. For the demo, the current date is the date in Auckland, where the demo will be presented.

## 8. Exclusions and known limitations

| Excluded | Planned for |
| --- | --- |
| Notifications from within the system, stakeholder dashboard, replenishment tracking and delivery dates | Iteration 2 |
| Stock allocation or reservation | Iteration 3 |
| Suggesting, submitting or approving alternative solutions. A catalogue match or higher rating does not establish suitability or compliance, which can depend on the project and consent. | Iteration 4 |
| Filtering or searching packages, crew scheduling, rescheduling packages, creating or editing packages, stock or mappings, ordering, supplier or ERP integrations, multiple suppliers, multi-location stock, and changes to the existing web or mobile apps | Not planned yet |

**Known limitations:**
- **Selected packages only:** the combined result ignores packages that aren't ticked, so unticked packages may need the same stock.
- **No share of stock per package:** the combined result shows a product's total shortfall, not which package would go without.
- **Missing catalogue match:** a code that isn't in the catalogue shows blank details, but its mapped products still count, and those mappings can't be checked against the catalogue. The CSV has no catalogue columns, so it shows no sign of this.
- **Stock accuracy:** figures are taken as recorded, so out-of-date stock can look sufficient. The SAMPLE data has no source timestamp to show.
- **Snapshot, not an audit record:** the CSV can be edited after export, and the system doesn't record that it was exported or shared.
