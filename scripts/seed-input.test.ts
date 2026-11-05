import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseSeedInput } from "./seed-input";

const realCsv = readFileSync("data/source/solutions-excerpt.csv", "utf8");
const realSample = JSON.parse(readFileSync("data/sample/sample-data.json", "utf8"));
const header = realCsv.split(/\r?\n/)[0];

function csvRow(code: string, service = "Copper Pipe", substrate = "Concrete") {
  return `${code},REF-${code},Ryanfire,Wall,${substrate},Other,${service},100mm,60,60,Other,Concrete Wall`;
}
function csvWith(rows: string[]) {
  return [header, ...rows].join("\n");
}
const validCsv = csvWith(Array.from({ length: 148 }, (_, i) => csvRow(String(1000 + i))));

function validSample() {
  return {
    label: "SAMPLE DATA: invented for this exercise",
    products: [{ id: "sealant-a", name: "Sample Sealant A", unit: "tube" }],
    solution_products: [
      { internal_code: "1000", product_id: "sealant-a", quantity_per_installation: "0.5" },
    ],
    work_packages: [
      { id: "pkg-a", name: "SAMPLE Package A", site: "Site", crew: "Crew", start_offset_days: 2 },
    ],
    planned_installations: [
      { id: "pi-1", work_package_id: "pkg-a", internal_code: "1000", installation_count: 2 },
    ],
    stock: [{ product_id: "sealant-a", quantity_on_hand: "0" }],
  };
}

function expectRejected(csv: string, sample: unknown, messagePart: RegExp) {
  const result = parseSeedInput(csv, sample);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.errors.join("\n")).toMatch(messagePart);
}

describe("Seed: valid input", () => {
  it("accepts a valid set of files and returns rows for each table", () => {
    const result = parseSeedInput(validCsv, validSample());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rows.solutions).toHaveLength(148);
    expect(Object.keys(result.rows).sort()).toEqual(
      ["planned_installations", "products", "solution_products", "solutions", "stock", "work_packages"],
    );
    expect(result.warnings).toEqual([]);
  });

  it("accepts a planned code that isn't in the catalogue but has products", () => {
    const sample = validSample();
    sample.solution_products.push({ internal_code: "9998", product_id: "sealant-a", quantity_per_installation: "3" });
    sample.planned_installations.push({ id: "pi-2", work_package_id: "pkg-a", internal_code: "9998", installation_count: 2 });
    expect(parseSeedInput(validCsv, sample).ok).toBe(true);
  });

  it("writes but reports a solution product code in neither the catalogue nor a planned installation", () => {
    const sample = validSample();
    sample.solution_products.push({ internal_code: "7777", product_id: "sealant-a", quantity_per_installation: "1" });
    const result = parseSeedInput(validCsv, sample);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.warnings.join("\n")).toContain("7777");
    expect(result.rows.solution_products).toHaveLength(2);
  });
});

describe("Seed: catalogue cleaning, using the supplied CSV", () => {
  const solutions = () => {
    const result = parseSeedInput(realCsv, realSample);
    if (!result.ok) throw new Error(result.errors.join("\n"));
    return result.rows.solutions;
  };
  const byCode = (code: string) => solutions().find((row) => row.internal_code === code)!;

  it("loads all 148 solutions, keeping leading zeros", () => {
    expect(solutions()).toHaveLength(148);
    expect(byCode("0334")).toBeDefined();
  });

  it("removes the trailing comma from 6 substrates", () => {
    expect(byCode("0853").substrate).toBe("Unlined Timber");
    expect(solutions().filter((row) => String(row.substrate).endsWith(","))).toHaveLength(0);
  });

  it("cleans extra spaces in service types", () => {
    const spaced = solutions().filter((row) => /^\s|\s$|\s{2,}/.test(String(row.service_type ?? "")));
    expect(spaced).toHaveLength(0);
  });

  it("stores the word Blank as an empty service type on 16 rows", () => {
    expect(byCode("0853").service_type).toBeNull();
    expect(solutions().filter((row) => row.service_type === null)).toHaveLength(16);
  });

  it("keeps a dash in insulation as supplied", () => {
    expect(byCode("0334").insulation).toBe("-");
  });

  it("keeps the supplied values in raw_row", () => {
    const raw = byCode("0853").raw_row as Record<string, string>;
    expect(raw["Substrate"]).toBe("Unlined Timber,");
    expect(raw["Service Type"]).toBe("Blank");
  });
});

describe("Seed: invalid catalogue is rejected", () => {
  it("rejects a CSV without exactly 148 rows", () => {
    expectRejected(csvWith([csvRow("1000")]), validSample(), /148/);
  });
  it("rejects a missing internal code", () => {
    const rows = Array.from({ length: 147 }, (_, i) => csvRow(String(1000 + i)));
    expectRejected(csvWith([...rows, csvRow("")]), validSample(), /internal code/i);
  });
  it("rejects a duplicate internal code", () => {
    const rows = Array.from({ length: 147 }, (_, i) => csvRow(String(1000 + i)));
    expectRejected(csvWith([...rows, csvRow("1000")]), validSample(), /duplicate/i);
  });
});

describe("Seed: invalid sample data is rejected", () => {
  it("rejects a file not labelled as SAMPLE DATA", () => {
    expectRejected(validCsv, { ...validSample(), label: "real" }, /SAMPLE DATA/);
  });

  it.each(["abc", "0", "-1", "1.2345", 0.5])("rejects a quantity per installation of %s", (value) => {
    const sample = validSample();
    (sample.solution_products[0] as Record<string, unknown>).quantity_per_installation = value;
    expectRejected(validCsv, sample, /quantity_per_installation/);
  });

  it.each(["abc", "-1", "1.2345", 5])("rejects stock on hand of %s", (value) => {
    const sample = validSample();
    (sample.stock[0] as Record<string, unknown>).quantity_on_hand = value;
    expectRejected(validCsv, sample, /quantity_on_hand/);
  });

  it.each([0, -1, 1.5, "2"])("rejects an installation count of %s", (value) => {
    const sample = validSample();
    (sample.planned_installations[0] as Record<string, unknown>).installation_count = value;
    expectRejected(validCsv, sample, /installation_count/);
  });

  it("rejects a product with no stock row", () => {
    expectRejected(validCsv, { ...validSample(), stock: [] }, /stock/i);
  });

  it("rejects a work package with no planned installations", () => {
    expectRejected(validCsv, { ...validSample(), planned_installations: [] }, /planned installations/i);
  });

  it("rejects a planned installation with no mapped products, in the catalogue or not", () => {
    const sample = validSample();
    sample.planned_installations.push({ id: "pi-2", work_package_id: "pkg-a", internal_code: "1001", installation_count: 1 });
    expectRejected(validCsv, sample, /1001/);
    const missing = validSample();
    missing.planned_installations.push({ id: "pi-3", work_package_id: "pkg-a", internal_code: "9999", installation_count: 1 });
    expectRejected(validCsv, missing, /9999/);
  });
});

describe("Seed: the real SAMPLE data supports the demo", () => {
  it("includes the cases the acceptance criteria rely on", () => {
    const planned = realSample.planned_installations.map((row: { internal_code: string }) => row.internal_code);
    expect(planned).toEqual(expect.arrayContaining(["0334", "0853", "9998"]));
    const names = realSample.work_packages.map((row: { name: string }) => row.name);
    expect(names).toEqual(expect.arrayContaining(["SAMPLE Package A", "SAMPLE Package B"]));
    const quantities = realSample.solution_products.map((row: { quantity_per_installation: string }) => row.quantity_per_installation);
    expect(quantities.some((value: string) => value.includes("."))).toBe(true);
  });
});
