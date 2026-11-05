import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const anon = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
  auth: { persistSession: false },
});

async function snapshot() {
  const { data, error } = await anon.from("work_packages").select("*").order("id");
  expect(error).toBeNull();
  return data;
}

describe("Security: anon access to work_packages", () => {
  it("can read the seeded rows", async () => {
    expect(await snapshot()).not.toHaveLength(0);
  });

  it("can't insert", async () => {
    const before = await snapshot();
    const { error } = await anon.from("work_packages").insert({
      id: "rls-test",
      name: "x",
      site: "x",
      crew: "x",
      start_offset_days: 1,
    });
    expect(error).not.toBeNull();
    expect(await snapshot()).toEqual(before);
  });

  // Blocked updates and deletes can report success while changing no rows,
  // so these compare the data rather than only checking for an error.
  it("can't update", async () => {
    const before = await snapshot();
    await anon.from("work_packages").update({ name: "changed" }).neq("id", "");
    expect(await snapshot()).toEqual(before);
  });

  it("can't delete", async () => {
    const before = await snapshot();
    await anon.from("work_packages").delete().neq("id", "");
    expect(await snapshot()).toEqual(before);
  });
});
