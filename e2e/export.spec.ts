import { readFileSync } from "node:fs";
import { expect, test, type Download, type Page } from "@playwright/test";
import { parse } from "csv-parse/sync";

// Seeded SAMPLE data, with both packages ticked: Sealant A needs 25 + 6 against stock of 20.
async function checkBoth(page: Page) {
  await page.goto("/");
  await page.getByRole("checkbox", { name: "SAMPLE Package A" }).check();
  await page.getByRole("checkbox", { name: "SAMPLE Package B" }).check();
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

function rowsOf(download: Download, path: string): Record<string, string>[] {
  expect(download.suggestedFilename()).toBe("material-check.csv");
  return parse(readFileSync(path, "utf8"), { columns: true });
}

async function exportRows(page: Page) {
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export" }).click();
  const download = await pending;
  return rowsOf(download, await download.path());
}

test("AC-18: the dashboard has no Export button until a check has run", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Export" })).toHaveCount(0);
});

test("AC-19: Package A's row has its own and the combined figures", async ({ page }) => {
  await checkBoth(page);
  const row = (await exportRows(page)).find((r) => r.package_name === "SAMPLE Package A" && r.product === "Sample Sealant A");
  expect(row).toMatchObject({ package_required: "25", combined_required: "31", on_hand: "20", combined_shortfall: "11", status: "Short" });
});

test("AC-20: an Available product has a row with a blank combined_shortfall", async ({ page }) => {
  await checkBoth(page);
  const row = (await exportRows(page)).find((r) => r.product === "Sample Sealant B");
  expect(row).toMatchObject({ status: "Available", combined_shortfall: "" });
});

test("AC-22: every row has the notice", async ({ page }) => {
  await checkBoth(page);
  for (const row of await exportRows(page)) {
    expect(row.notice).toBe("SAMPLE DATA. Stock is not reserved. This is not a compliance statement.");
  }
});

test("AC-24: after the connection is lost, the file has the values shown in the dialog", async ({ page, context }) => {
  await checkBoth(page);
  const shown = await page
    .getByRole("region", { name: "Combined result" })
    .getByRole("row", { name: /Sample Sealant A/ })
    .locator("> *")
    .allTextContents();

  await context.setOffline(true);
  const row = (await exportRows(page)).find((r) => r.product === "Sample Sealant A");
  expect(shown).toEqual([`Sample Sealant A (${row!.unit})`, row!.combined_required, row!.on_hand, row!.combined_shortfall, row!.status]);
});

test("Accessibility: Export works using only the keyboard", async ({ page }) => {
  await checkBoth(page);
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export" }).focus();
  await page.keyboard.press("Enter");
  expect((await pending).suggestedFilename()).toBe("material-check.csv");
});

test.describe("in a browser outside New Zealand", () => {
  test.use({ timezoneId: "America/New_York" });

  test("AC-21: exported_at is still the Auckland time, with its offset", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-04T20:30:00Z"));
    await checkBoth(page);
    expect((await exportRows(page))[0].exported_at).toBe("2026-11-05T09:30:00+13:00");
  });
});
