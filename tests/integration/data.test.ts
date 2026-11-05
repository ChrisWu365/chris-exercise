// Reads the seeded SAMPLE data using the anon key, as the app does. Changes nothing.
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { getCheckInputs } from "../../src/data/check-inputs";
import { listPackages } from "../../src/data/packages";

const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
  auth: { persistSession: false },
});
const today = "2026-11-06";

const solutionFor = async (packageId: string, code: string) => {
  const { solutions } = await getCheckInputs(client, [packageId], today);
  return solutions.find((solution) => solution.internal_code === code);
};

describe("Data access", () => {
  it("AC-01: Package A, starting in 2 days, is listed above Package B, starting in 5", async () => {
    const names = (await listPackages(client, today)).map((row) => row.name);
    expect(names.slice(0, 2)).toEqual(["SAMPLE Package A", "SAMPLE Package B"]);
  });

  it("AC-13: 0334 has its catalogue values", async () => {
    expect(await solutionFor("pkg-a", "0334")).toMatchObject({
      internal_code: "0334",
      supplier_ref_code: "V1.11-22SFR00038-146-E",
      orientation: "Wall",
      service_type: "Copper Pipe",
      service_size: "Ø100mm",
      integrity: "60",
      insulation: "-",
    });
  });

  it("AC-14: 0853's substrate is Unlined Timber, with no trailing comma", async () => {
    expect((await solutionFor("pkg-b", "0853"))?.substrate).toBe("Unlined Timber");
  });

  it("AC-30: 0853's service type is blank, not the word Blank", async () => {
    expect((await solutionFor("pkg-b", "0853"))?.service_type).toBeNull();
  });

  it("AC-10: reads only the ticked package's installations, so an unticked package isn't counted", async () => {
    const { packages, installations } = await getCheckInputs(client, ["pkg-a"], today);
    expect(packages.map((row) => row.id)).toEqual(["pkg-a"]);
    expect(installations.map((row) => row.work_package_id)).toEqual(["pkg-a", "pkg-a"]);
  });

  it("AC-31: 9998 has no catalogue row, and its mapped products are still read", async () => {
    const { installations, solutions, solution_products } = await getCheckInputs(client, ["pkg-b"], today);
    expect(installations.map((row) => row.internal_code)).toContain("9998");
    expect(solutions.map((row) => row.internal_code)).not.toContain("9998");
    expect(solution_products.map((row) => row.internal_code)).toContain("9998");
  });

  it("Design section 8: numeric quantities arrive as text", async () => {
    const { stock, solution_products } = await getCheckInputs(client, ["pkg-c"], today);
    expect(stock).toEqual([{ product_id: "wrap-c", quantity_on_hand: "0.300" }]);
    expect(solution_products).toEqual([{ internal_code: "0344", product_id: "wrap-c", quantity_per_installation: "0.100" }]);
  });

  it("FR-5: a package's start date comes from today and its start offset", async () => {
    const { packages } = await getCheckInputs(client, ["pkg-a"], today);
    expect(packages[0]).toEqual({
      id: "pkg-a",
      name: "SAMPLE Package A",
      site: "SAMPLE Site North",
      start_date: "2026-11-08",
      crew: "SAMPLE Crew 1",
    });
  });

  it("FR-3: reads the products the ticked packages need, and their stock", async () => {
    const { products, stock } = await getCheckInputs(client, ["pkg-a"], today);
    expect(products).toEqual([{ id: "sealant-a", name: "Sample Sealant A", unit: "tube" }]);
    expect(stock.map((row) => row.product_id)).toEqual(["sealant-a"]);
  });
});
