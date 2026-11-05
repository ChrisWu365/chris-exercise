// Runs only against CI's throwaway database, because these tests change data.
import { execFileSync, spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});
const tables = ["solutions", "products", "solution_products", "work_packages", "planned_installations", "stock"];

function seed() {
  execFileSync("node", ["scripts/seed.ts", "--target", "ci"], { stdio: "pipe" });
}

async function allRows() {
  const entries = await Promise.all(
    tables.map(async (table) => {
      const { data, error } = await admin.from(table).select("*");
      expect(error).toBeNull();
      const sorted = [...data!].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
      return [table, sorted] as const;
    }),
  );
  return Object.fromEntries(entries);
}

describe("Seed: against a real database", () => {
  it("loads all 148 solutions", async () => {
    seed();
    expect((await allRows()).solutions).toHaveLength(148);
  });

  it("gives the same rows when run twice", async () => {
    seed();
    const first = await allRows();
    seed();
    expect(await allRows()).toEqual(first);
  });

  it("removes a row that is no longer in the files", async () => {
    seed();
    await admin.from("products").insert({ id: "stale-product", name: "Stale", unit: "x" });
    seed();
    const { data } = await admin.from("products").select("id").eq("id", "stale-product");
    expect(data).toEqual([]);
  });

  it("keeps planned installations and solution products when solutions are removed", async () => {
    seed();
    const before = await allRows();
    const { error } = await admin.from("solutions").delete().neq("internal_code", "");
    expect(error).toBeNull();
    const after = await allRows();
    expect(after.solutions).toEqual([]);
    expect(after.planned_installations).toEqual(before.planned_installations);
    expect(after.solution_products).toEqual(before.solution_products);
    seed();
  });

  it.each([
    ["negative stock", "stock", { product_id: "sealant-a", quantity_on_hand: "-1" }],
    ["zero quantity per installation", "solution_products", { internal_code: "0334", product_id: "wrap-c", quantity_per_installation: "0" }],
    ["zero installation count", "planned_installations", { id: "bad", work_package_id: "pkg-a", internal_code: "0334", installation_count: 0 }],
    ["a missing product name", "products", { id: "bad", unit: "x" }],
    ["stock for an unknown product", "stock", { product_id: "no-such-product", quantity_on_hand: "1" }],
    ["an installation for an unknown package", "planned_installations", { id: "bad", work_package_id: "no-such-package", internal_code: "0334", installation_count: 1 }],
  ])("the database itself rejects %s", async (_name, table, row) => {
    seed();
    const before = await allRows();
    const { error } = await admin.from(table).upsert(row as Record<string, unknown>);
    expect(error).not.toBeNull();
    expect(await allRows()).toEqual(before);
  });

  it("writes nothing and gives a clear error when no target is named", () => {
    const run = spawnSync("node", ["scripts/seed.ts"], { encoding: "utf8" });
    expect(run.status).not.toBe(0);
    expect(run.stderr).toContain("nothing written");
  });
});
