import { expect, test } from "@playwright/test";

test("AC-01: Package A, starting sooner, is listed above Package B", async ({ page }) => {
  await page.goto("/");
  const names = await page.getByRole("checkbox").evaluateAll((boxes) => boxes.map((box) => box.getAttribute("aria-label")));
  expect(names.slice(0, 2)).toEqual(["SAMPLE Package A", "SAMPLE Package B"]);
});

test("AC-05: Check is disabled until a package is ticked", async ({ page }) => {
  await page.goto("/");
  const check = page.getByRole("button", { name: "Check" });
  await expect(check).toBeDisabled();
  await page.getByRole("checkbox", { name: "SAMPLE Package A" }).check();
  await expect(check).toBeEnabled();
});
