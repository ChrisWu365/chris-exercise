import { parse } from "csv-parse/sync";
import { describe, expect, it } from "vitest";
import type { CheckSuccess, PackageResult } from "./check";
import { buildCsv } from "./csv";

const exportedAt = new Date("2026-11-04T20:30:00Z"); // 9:30 am on 5 Nov 2026 in Auckland

function packageResult(id: string, name: string, required: PackageResult["required"]): PackageResult {
  return { id, name, site: "SAMPLE Site North", start_date: "2026-11-08", crew: "SAMPLE Crew 1", installations: [], required };
}

const result: CheckSuccess = {
  outcome: "ok",
  combined: [
    { product_id: "sealant-a", product: "Sample Sealant A", unit: "tube", required: "25", on_hand: "20", shortfall: "5", status: "Short" },
    { product_id: "sealant-b", product: "Sample Sealant B", unit: "tube", required: "2", on_hand: "50", shortfall: null, status: "Available" },
  ],
  packages: [
    packageResult("pkg-a", "SAMPLE Package A", [
      { product_id: "sealant-a", required: "15" },
      { product_id: "sealant-b", required: "2" },
    ]),
    packageResult("pkg-b", "SAMPLE Package B", [{ product_id: "sealant-a", required: "10" }]),
  ],
};

function rowsOf(csv: string): Record<string, string>[] {
  return parse(csv, { columns: true });
}

const rows = (input = result, at = exportedAt) => rowsOf(buildCsv(input, at));

function resultWithSite(site: string): CheckSuccess {
  return { ...result, packages: [{ ...result.packages[0], site }] };
}

describe("Export", () => {
  it("AC-19: Package A's row shows package_required 15, combined_required 25, on_hand 20, combined_shortfall 5 and Short", () => {
    expect(rows()[0]).toMatchObject({
      package_name: "SAMPLE Package A",
      product: "Sample Sealant A",
      package_required: "15",
      combined_required: "25",
      on_hand: "20",
      combined_shortfall: "5",
      status: "Short",
    });
  });

  it("AC-20: an Available product has a row with a blank combined_shortfall", () => {
    const row = rows().find((candidate) => candidate.product === "Sample Sealant B");
    expect(row).toMatchObject({ status: "Available", combined_shortfall: "" });
  });

  it("AC-21: exported_at is the Auckland time with its offset, in daylight time", () => {
    expect(rows()[0].exported_at).toBe("2026-11-05T09:30:00+13:00");
  });

  it("AC-21: exported_at uses the standard time offset in July", () => {
    expect(rows(result, new Date("2026-07-01T12:00:00Z"))[0].exported_at).toBe("2026-07-02T00:00:00+12:00");
  });

  it("AC-22: every row has the notice", () => {
    for (const row of rows()) {
      expect(row.notice).toBe("SAMPLE DATA. Stock is not reserved. This is not a compliance statement.");
    }
  });

  it("FR-5: the header row lists every column, in order", () => {
    expect(buildCsv(result, exportedAt).split(/\r?\n/)[0]).toBe(
      "exported_at,package_name,site,start_date,crew,product,unit,package_required,combined_required,on_hand,combined_shortfall,status,notice",
    );
  });

  it("FR-5: there is one row for each product in each package, with the package's details", () => {
    const all = rows();
    expect(all.map((row) => [row.package_name, row.product])).toEqual([
      ["SAMPLE Package A", "Sample Sealant A"],
      ["SAMPLE Package A", "Sample Sealant B"],
      ["SAMPLE Package B", "Sample Sealant A"],
    ]);
    expect(all[0]).toMatchObject({ site: "SAMPLE Site North", start_date: "2026-11-08", crew: "SAMPLE Crew 1", unit: "tube" });
  });

  it.each(["=SUM(A1)", "+1", "-1", "@cmd"])("FR-5: formula safety puts an apostrophe before %s", (site) => {
    expect(rows(resultWithSite(site))[0].site).toBe(`'${site}`);
  });

  it.each(["North, Level 2", 'The "North" site', "North\nLevel 2"])("FR-5: keeps %j intact through quoting", (site) => {
    expect(rows(resultWithSite(site))[0].site).toBe(site);
  });
});
