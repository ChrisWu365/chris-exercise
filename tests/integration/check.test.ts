// Runs the check's logic against the seeded SAMPLE data, using the anon key. Changes nothing.
import { createClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { performCheck } from "../../src/data/perform-check";

const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
  auth: { persistSession: false },
});
const today = "2026-11-06";

afterEach(() => vi.restoreAllMocks());

describe("Check logic", () => {
  it("AC-06: Package A's seeded data gives required 25, on hand 20, shortfall 5 and Short", async () => {
    const result = await performCheck(client, ["pkg-a"], today);
    expect(result).toMatchObject({
      outcome: "ok",
      combined: [{ product: "Sample Sealant A", required: "25", on_hand: "20", shortfall: "5", status: "Short" }],
    });
  });

  it.each([
    ["an empty list", []],
    ["an unknown ID", ["no-such-package"]],
    ["a known and an unknown ID", ["pkg-a", "no-such-package"]],
    ["something other than a list", "pkg-a"],
  ])("Design section 11: %s is invalid_selection", async (_name, ids) => {
    expect(await performCheck(client, ids, today)).toEqual({ outcome: "invalid_selection" });
  });

  it("AC-27: an unreachable database is unavailable, and the failure is logged", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const unreachable = createClient("http://127.0.0.1:1", "test-key", { auth: { persistSession: false } });
    expect(await performCheck(unreachable, ["pkg-a"], today)).toEqual({ outcome: "unavailable" });
    expect(log).toHaveBeenCalled();
  });
});
