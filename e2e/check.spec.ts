import { expect, test, type Page } from "@playwright/test";

// The seeded SAMPLE data: Package A needs 25 of Sealant A, and Package B needs 6
// of Sealant A and 2 of Sealant B. Stock is 20 of Sealant A and 50 of Sealant B.
async function check(page: Page, ...names: string[]) {
  await page.goto("/");
  for (const name of names) await page.getByRole("checkbox", { name }).check();
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

const cells = (page: Page, regionName: string, rowName: RegExp) =>
  page.getByRole("region", { name: regionName }).getByRole("row", { name: rowName }).locator("> *").allTextContents();

test("AC-06: Package A shows required 25, on hand 20, shortfall 5 and Short", async ({ page }) => {
  await check(page, "SAMPLE Package A");
  expect(await cells(page, "Combined result", /Sample Sealant A/)).toEqual(["Sample Sealant A (tube)", "25", "20", "5", "Short"]);
});

test("AC-09: ticking two packages combines their demand", async ({ page }) => {
  await check(page, "SAMPLE Package A", "SAMPLE Package B");
  expect(await cells(page, "Combined result", /Sample Sealant A/)).toEqual(["Sample Sealant A (tube)", "31", "20", "11", "Short"]);
  expect(await cells(page, "Combined result", /Sample Sealant B/)).toEqual(["Sample Sealant B (tube)", "2", "50", "", "Available"]);
});

test("AC-10: an unticked package isn't counted", async ({ page }) => {
  await check(page, "SAMPLE Package B");
  expect(await cells(page, "Combined result", /Sample Sealant A/)).toEqual(["Sample Sealant A (tube)", "6", "20", "", "Available"]);
});

test("AC-12 and AC-16: the combined result is above the package details, with the stock notice", async ({ page }) => {
  await check(page, "SAMPLE Package A");
  const combined = await page.getByRole("region", { name: "Combined result" }).boundingBox();
  const details = await page.getByRole("region", { name: "SAMPLE Package A" }).boundingBox();
  expect(combined!.y).toBeLessThan(details!.y);
  await expect(page.getByRole("dialog")).toContainText("Stock is not reserved");
});

test("AC-13: 0334 shows its catalogue values", async ({ page }) => {
  await check(page, "SAMPLE Package A");
  const row = page.getByRole("region", { name: "SAMPLE Package A" }).getByRole("row", { name: /0334/ });
  for (const value of ["0334", "V1.11-22SFR00038-146-E", "Wall", "Copper Pipe", "Ø100mm", "60", "-"]) {
    await expect(row.getByRole("cell", { name: value, exact: true }).first()).toBeAttached();
  }
});

test("AC-14 and AC-30: 0853's substrate has no trailing comma, and its service type is blank", async ({ page }) => {
  await check(page, "SAMPLE Package B");
  const row = await cells(page, "SAMPLE Package B", /0853/);
  expect(row[3]).toBe("Unlined Timber");
  expect(row[4]).toBe("");
  expect(row).not.toContain("Blank");
});

test("AC-31: 9998 shows blank catalogue details and required 6", async ({ page }) => {
  await check(page, "SAMPLE Package B");
  expect((await cells(page, "SAMPLE Package B", /9998/)).slice(1, 8)).toEqual(["", "", "", "", "", "", ""]);
  expect(await cells(page, "SAMPLE Package B", /Sample Sealant A/)).toEqual(["Sample Sealant A (tube)", "6"]);
});

test("AC-03: after closing the dialog, the dashboard shows no status and the tick is kept", async ({ page }) => {
  await check(page, "SAMPLE Package A");
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByText("Short", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Export" })).toHaveCount(0);
  await expect(page.getByRole("checkbox", { name: "SAMPLE Package A" })).toBeChecked();
});

test("AC-17: Short is visible and Export can be reached, on both screen sizes", async ({ page }) => {
  await check(page, "SAMPLE Package A");
  await expect(page.getByRole("region", { name: "Combined result" }).getByText("Short", { exact: true })).toBeInViewport();
  const exportButton = page.getByRole("button", { name: "Export" });
  await exportButton.scrollIntoViewIfNeeded();
  await expect(exportButton).toBeInViewport();
});

test("Accessibility: tick, check and close using only the keyboard", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("checkbox", { name: "SAMPLE Package A" }).focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Check" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
