import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const anon = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
  auth: { persistSession: false },
});

const tables: [string, Record<string, unknown>, string][] = [
  ["solutions", { internal_code: "rls-test" }, "internal_code"],
  ["products", { id: "rls-test", name: "x", unit: "x" }, "id"],
  ["solution_products", { internal_code: "rls-test", product_id: "rls-test", quantity_per_installation: "1" }, "internal_code"],
  ["work_packages", { id: "rls-test", name: "x", site: "x", crew: "x", start_offset_days: 1 }, "id"],
  ["planned_installations", { id: "rls-test", work_package_id: "rls-test", internal_code: "rls-test", installation_count: 1 }, "id"],
  ["stock", { product_id: "rls-test", quantity_on_hand: "1" }, "product_id"],
];

describe.each(tables)("Security: anon access to %s", (table, row, key) => {
  async function snapshot() {
    const { data, error } = await anon.from(table).select("*").order(key);
    expect(error).toBeNull();
    return data;
  }

  it("can read the seeded rows", async () => {
    expect(await snapshot()).not.toHaveLength(0);
  });

  it("can't insert", async () => {
    const before = await snapshot();
    const { error } = await anon.from(table).insert(row);
    expect(error).not.toBeNull();
    expect(await snapshot()).toEqual(before);
  });

  // Blocked updates and deletes can report success while changing no rows,
  // so these compare the data rather than only checking for an error.
  it("can't update", async () => {
    const before = await snapshot();
    await anon.from(table).update(row).neq(key, "");
    expect(await snapshot()).toEqual(before);
  });

  it("can't delete", async () => {
    const before = await snapshot();
    await anon.from(table).delete().neq(key, "");
    expect(await snapshot()).toEqual(before);
  });
});
