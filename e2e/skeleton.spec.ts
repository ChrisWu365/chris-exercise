import { expect, test } from "@playwright/test";

test("Skeleton: the dashboard shows work packages read from Supabase", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Planned work packages" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "SAMPLE Package A" })).toBeVisible();
  await expect(page.getByText("SAMPLE data")).toBeVisible();
});
