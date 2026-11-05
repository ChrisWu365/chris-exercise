# Test strategy: material readiness dashboard

This strategy covers [the first-slice specification](02-slice-spec.md) and [the technical design](03-technical-design.md). FR and AC numbers refer to the specification.

**Status:** this is the plan. The application and its tests haven't been built yet, so nothing here has been run.

## Table of contents

1. [Approach](#1-approach)
2. [Main risks](#2-main-risks)
3. [Test levels and tools](#3-test-levels-and-tools)
4. [Acceptance criteria mapping](#4-acceptance-criteria-mapping)
5. [Requirements without their own acceptance criterion](#5-requirements-without-their-own-acceptance-criterion)
6. [Test data and repeatability](#6-test-data-and-repeatability)
7. [How failures are simulated](#7-how-failures-are-simulated)
8. [Order of work](#8-order-of-work)
9. [Running tests in CI/CD](#9-running-tests-in-cicd)
10. [What this leaves untested](#10-what-this-leaves-untested)

## 1. Approach

- **Test first.** For each criterion or small related group, the test is written first and run to show that it fails. Work stops for review before implementing.
- **Test where the behaviour lives.** Calculation and CSV rules get most of the cases, because they are pure and fast. Database guarantees are tested against a real database, and user journeys in a real browser.
- **Trace every test to a requirement.** Test titles start with the criterion's ID, such as `AC-09: combines demand across ticked packages`. A small CI script fails if any AC in the specification has no test.
- **Keep tests honest.** A test or criterion that seems wrong is raised for review. It is never changed, skipped or weakened to make a check pass.
- **Measure by requirements, not percentages.** There is no code coverage target to pass. Coverage reports are only used to find untested branches in `src/domain`.

## 2. Main risks

| Risk | Consequence | Main protection |
| --- | --- | --- |
| Wrong total across ticked packages | A false shortage or false reassurance | Unit tests of combined totals and exact boundaries (AC-06 to AC-10) |
| Floating point error in a quantity | A false `Short` or `Available` | Unit tests with decimals, and an integration test that real `numeric` values arrive as text (AC-11) |
| A code missing from the catalogue hides demand | A team leader trusts an understated total | Tests of blank details, counted products and the warning (AC-15, AC-28, AC-29, AC-31, AC-32) |
| The app implies stock is reserved or compliant | A team leader relies on a false guarantee | Wording tests (AC-16, AC-22) and RLS tests that keep data read-only |
| The CSV differs from the dialog, or loses its notice | A shared file misleads people outside the system | Tests of file contents, including after the connection is lost (AC-19 to AC-24) |
| A CSV value runs as a spreadsheet formula | A shared file could run unwanted commands | Unit tests of formula safety |
| A public visitor changes data | The demo gives wrong results | RLS tests using the anon key |
| Credentials reach the browser | Database access is exposed | Check of the built browser files |
| Bad seed data reaches Supabase | Results are wrong without any error | Seed tests with invalid fixtures |
| Catalogue cleaning changes values wrongly | Displayed details no longer match the source | Comparison of all 148 rows with the CSV |
| A failure looks like an empty or healthy page | A team leader trusts a page that failed | Failure-state tests (AC-25, AC-27) |
| Schema differs between environments | A deployment works in CI but fails in production | Migration rebuild and drift checks |

## 3. Test levels and tools

| Level | Tool | Scope | Runs against |
| --- | --- | --- | --- |
| Unit | Vitest, with the process in UTC | Quantity arithmetic, check rules, CSV builder, Auckland dates | No external services |
| Component | Vitest, React Testing Library | Package selector, results dialog and notices, including failure states | Simulated DOM, with data passed as props |
| Integration | Vitest | `src/data` queries, RLS policies, seed script | Throwaway Supabase, rebuilt from migrations |
| End-to-end | Playwright, using desktop and phone viewports | Full user journeys through the production build | Throwaway Supabase, seeded |
| Smoke | Playwright | Check of the deployed site, which can't change any data | Public URL |
| Pipeline checks | ESLint, TypeScript, Supabase CLI, small scripts | Lint, types, schema match and drift, browser files, AC traceability | Repository and databases |

These test tools are the only dependencies this strategy adds. Vitest suits a TypeScript project with little setup, React Testing Library tests components as users see them, and Playwright drives a real browser, emulates a phone and checks downloaded files.

**Assumption for the build:** the `runCheck` server action stays thin and calls plain functions, so integration tests can exercise that logic without the Next.js runtime. End-to-end tests cover the real action.

## 4. Acceptance criteria mapping

| AC | What is verified | Unit | Comp. | Integ. | E2E |
| --- | --- | --- | --- | --- | --- |
| AC-01 | Sooner package is listed first | | | ✓ | ✓ |
| AC-02 | All 12 packages are listed, with no page controls | | ✓ | | |
| AC-03 | No status on the dashboard after a check and closing the dialog | | ✓ | | ✓ |
| AC-04 | Start date is 8 Nov 2026 when Auckland's date is ahead of UTC | ✓ | ✓ | | |
| AC-05 | "Check" is disabled with nothing ticked | | ✓ | | ✓ |
| AC-06 | 10 × 2 plus 5 × 1 with stock of 20 gives required 25, shortfall 5, `Short` | ✓ | | | ✓ |
| AC-07 | Required 25 with stock of 25 is `Available`, with no shortfall | ✓ | ✓ | | |
| AC-08 | Required 1 with stock of 0 gives shortfall 1, `Short` | ✓ | | | |
| AC-09 | 15 + 10 with stock of 20 gives required 25, shortfall 5, `Short` | ✓ | | | ✓ |
| AC-10 | Only Package A ticked gives required 15, `Available` | ✓ | | | ✓ |
| AC-11 | 0.1 + 0.2 with stock of 0.3 gives required 0.3, `Available` | ✓ | | ✓ | |
| AC-12 | Combined result appears above the package details | | ✓ | | ✓ |
| AC-13 | `0334` shows its catalogue values | | | ✓ | ✓ |
| AC-14 | `0853` substrate is `Unlined Timber`, with no trailing comma | | | ✓ | ✓ |
| AC-15 | `9999` shows blank catalogue details and quantities | ✓ | ✓ | | ✓ |
| AC-16 | Dialog shows "Stock is not reserved" | | ✓ | | ✓ |
| AC-17 | `Short` is visible and "Export" can be reached at phone width | | | | ✓ |
| AC-18 | No "Export" button when the dialog isn't open | | ✓ | | ✓ |
| AC-19 | Package A's CSV row has the package and combined figures | ✓ | | | ✓ |
| AC-20 | `Available` row is present, with a blank `combined_shortfall` | ✓ | | | |
| AC-21 | `exported_at` is `2026-11-05T09:30:00+13:00` | ✓ | | | ✓ |
| AC-22 | Every row has the exact `notice` text | ✓ | | | ✓ |
| AC-23 | `9999` adds a row with blank product and quantity columns | ✓ | | | ✓ |
| AC-24 | Export after losing the connection matches the dialog | | | | ✓ |
| AC-25 | Database unavailable on load gives an error and retry, with no list | | ✓ | | ✓ |
| AC-26 | No packages gives "No planned work packages" | | ✓ | | |
| AC-27 | Database unavailable on "Check" gives an error and retry, with no result or "Export" | | ✓ | ✓ | ✓ |
| AC-28 | `9999` shows the warning above the combined result | ✓ | ✓ | | ✓ |
| AC-29 | `9998` doesn't show the warning | ✓ | ✓ | | |
| AC-30 | `0853` service type is blank, and the word `Blank` doesn't appear | | | ✓ | ✓ |
| AC-31 | `9998` shows blank catalogue details and required 6 | ✓ | ✓ | | |
| AC-32 | `9998` and `0334` together give required 16 | ✓ | | | ✓ |

### Example cases

**Decimals (AC-11):**

| Calculation | Stock | Expected result |
| --- | --- | --- |
| 0.1 + 0.2 = 0.3 | 0.3 | `Available` |
| 3 × 0.335 = 1.005 | 1.004 | `Short`, shortfall 0.001 |
| 999999999.999 (largest valid value) × 1 | 999999999.999 | `Available` |

**Auckland date (AC-04, AC-21):**

| Time (UTC) | Expected Auckland date | Case |
| --- | --- | --- |
| `2026-11-05T10:59:00Z` | 2026-11-05 | Just before midnight, daylight time |
| `2026-11-05T11:00:00Z` | 2026-11-06 | Midnight, daylight time |
| `2026-07-01T11:59:00Z` | 2026-07-01 | Just before midnight, standard time |
| `2026-07-01T12:00:00Z` | 2026-07-02 | Midnight, standard time |

**Formula safety (FR-5):** values starting with `=`, `+`, `-` or `@` get a leading apostrophe. Values with commas, quotes or line breaks are quoted correctly.

**Wording (FR-6):** tests check that "allocated" and "held" never appear, and that "reserved" appears only in the statement that stock isn't reserved.

## 5. Requirements without their own acceptance criterion

These still need tests, because a requirement could otherwise pass unverified. Their titles start with the FR or area, such as `FR-5: header row lists every column`.

| Requirement | Test | Level |
| --- | --- | --- |
| FR-1: rows show all fields, with a stable order for shared start dates | Rendered row, and order across repeated loads | Component, Integration |
| FR-4: dialog shows package details for each ticked package | Rendered dialog | Component |
| FR-5: the CSV has every column, in order | Header row of the built file | Unit |
| FR-6: the rest of the notices appear on the list and dialog | Sample data, projection, compliance and site readiness text | Component |
| Accessibility: status has text, and the main flow works by keyboard | Tick, check, export and close using only the keyboard | Component, E2E |
| Usability: the main flow works on phone and desktop | Full journey at both viewports | E2E |
| Design section 8: broken stored data never shows as zero stock | A product with no stock row gives `unavailable` | Unit, Integration |
| Design section 11: `runCheck` validates its input | An empty list and an unknown ID give `invalid_selection` | Integration |
| Design section 8: quantities reach the rules as text | `src/data` returns strings for `numeric` columns | Integration |
| Security: database access matches the design | See below | Integration |
| Security: no credentials in browser code | Search the built browser files for the Supabase URL and key values, and for `service_role` | Pipeline |
| Runtime reads only from Supabase | `src` doesn't import from `data/`, and the build doesn't bundle those files | Pipeline |
| Diagnostics: load and check failures are logged | Spy on the logger during a failed read | Integration |
| Database as Code: schema comes only from migrations | Rebuild from empty, and check for differences | Pipeline |

**RLS tests** use the anon key against the rebuilt database, for `solutions`, `products`, `solution_products`, `work_packages`, `planned_installations` and `stock`:

| Allowed | Denied |
| --- | --- |
| `SELECT` | `INSERT`, `UPDATE`, `DELETE` |

Blocked updates and deletes can report success while changing no rows, so these tests compare the data before and after, rather than only checking for an error.

**Seed tests** run the script against the throwaway database:

| Case | Expected result |
| --- | --- |
| Valid files | 148 solutions are loaded, and stored values match the cleaning rules: 6 trailing commas removed, 15 `Service Type` values with spaces cleaned, 16 `Blank` values empty, and `raw_row` equal to the CSV |
| Run twice | Rows are unchanged |
| A row removed from the files | It is removed from the database |
| The CSV doesn't have 148 rows, or a code is missing or duplicated | Clear error, and nothing written |
| A value isn't valid: non-numeric, zero or negative quantity, negative stock, or more than three decimal places | Clear error, and nothing written. The seed must check decimal places itself, because `numeric(12,3)` would silently round `1.2345` to `1.235` |
| A product has no stock row, a package has no installations, or a catalogue solution has no products | Clear error, and nothing written |
| A planned code isn't in the catalogue, with or without products | Written |
| A `solution_products` code is in neither the catalogue nor a planned installation | Reported as possibly mistyped, and written |
| No target project named | Clear error, and nothing written |
| Removing solutions from the catalogue | Existing `planned_installations` and `solution_products` rows are unchanged |

## 6. Test data and repeatability

| Level | Data |
| --- | --- |
| Unit and component | Small inline fixtures, with fixed dates passed in |
| Seed tests | Small fixture files, including invalid ones |
| Integration and end-to-end | The real seed files, so the demo data is itself tested |
| Smoke | Whatever is deployed |

- **SAMPLE data must support the demo:** a test checks that the seed includes Package A and B sharing a product, a shortage, an `Available` product, decimals, `0334`, `0853`, `9998` and `9999`.
- **Isolation:** the app can't write, so tests can't affect each other's data and can run in parallel. Seed tests run on their own database, or separately from the rest.
- **Stable references:** tests find packages by fixed sample IDs, not by position or date.
- **Fixed time in the browser:** Playwright sets the browser's clock and a non-Auckland time zone for AC-21, to prove the file doesn't depend on the viewer's location.
- **No automatic retries:** a failing test is investigated rather than rerun until it passes.

## 7. How failures are simulated

| Failure | Method | Level |
| --- | --- | --- |
| Database unavailable on load or "Check" | The test app reaches Supabase through a small test proxy, and the test closes the proxy | E2E |
| Database unavailable in `runCheck` logic | Point the data module at an unreachable URL | Integration |
| Connection lost after a check | Playwright sets the browser offline before clicking "Export" | E2E |
| Failure states on screen | Pass an `unavailable` result to the component | Component |
| Bad seed data | Run the script on invalid fixture files | Integration |

No test-only switches are added to production code. The proxy is test code only, and the app simply sees a different Supabase URL.

## 8. Order of work

Project and test setup comes first, because a failing test needs something to run on. It has no criterion of its own. After that, each row is one task of about 300 lines or fewer, with its tests written first and stopped for review.

| Task | Covers |
| --- | --- |
| 1. Schema, RLS and seed | Section 5's RLS and seed tests |
| 2. Quantities and calculation | AC-06 to AC-11, AC-32 |
| 3. CSV builder | AC-19 to AC-23 and formula safety |
| 4. Data access | AC-01, AC-13, AC-14, AC-30 and text quantities |
| 5. Dashboard | AC-02, AC-04, AC-05, AC-18, AC-25, AC-26 |
| 6. Results dialog and check | AC-03, AC-12, AC-15 to AC-17, AC-27 to AC-29, AC-31 |
| 7. Export in the browser | AC-24, and the end-to-end export journey |
| 8. CI/CD and smoke test | Section 9 |

## 9. Running tests in CI/CD

| Stage | Checks | If it fails |
| --- | --- | --- |
| Static | Lint, type-check, AC traceability script | The pipeline stops |
| Fast tests | Unit and component | The pipeline stops |
| Build | Production build, credential check on browser files | The pipeline stops |
| Database | Rebuild throwaway Supabase from migrations, check for differences, seed | The pipeline stops |
| Slow tests | Integration and end-to-end, with the Playwright report and failure traces saved as artifacts | The pipeline stops |
| Before deploying (`main` only) | Production schema drift check, then migrations | Nothing is deployed |
| After deploying (`main` only) | Smoke test | The run fails and needs attention |

**The smoke test** loads the dashboard, ticks a package, clicks "Check", checks that a status and the notices appear, and exports the CSV. This can't change anything, because the app has no write access. It does need seeded data, so the owner must seed the production project before the first deployment.

**Failed smoke tests don't roll back automatically.** Rollback would be a manual step in the exercise, and production would need a defined procedure.

## 10. What this leaves untested

| Not tested | Why | What it would take |
| --- | --- | --- |
| Real stock accuracy, material mappings and volumes | Only SAMPLE data exists | Access to real sources and a data-quality review |
| Whether team leaders understand the result and find the CSV useful | Automated tests can't show this | Trying it with real team leaders and stakeholders |
| How the CSV behaves in each spreadsheet program | Tests check the file's contents, not Excel or Google Sheets | Opening it in the programs people use |
| Load and performance, including the 1,000-row response limit | The sample volume is small and the spec sets no target | Load tests when real volumes are known |
| Browsers other than Chromium, and real phones | Playwright's phone viewport is an emulation | Add browsers or devices if production needs them |
| Full accessibility audit | The spec requires text status and keyboard use only | An audit against an agreed standard |
| Security beyond the listed checks | Proportional to a demo holding only SAMPLE data | A security review, including sign-in and tenant isolation, before production |
| The seed run against the local and production projects | It runs by hand, with keys CI doesn't hold | Checking the result after each manual run |
| Offline use and the mobile app | Out of scope for this slice | Tests if on-site use is validated |
