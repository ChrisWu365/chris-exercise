import { describe, expect, it } from "vitest";
import { checkPackages, type CheckInput, type CheckResult, type Solution } from "./check";

const sealantA = { id: "sealant-a", name: "Sample Sealant A", unit: "tube" };
const sealantB = { id: "sealant-b", name: "Sample Sealant B", unit: "tube" };

const packageRow = (id: string, name: string) => ({
  id,
  name,
  site: "SAMPLE Site North",
  start_date: "2026-11-08",
  crew: "SAMPLE Crew 1",
});
const packageA = packageRow("pkg-a", "SAMPLE Package A");
const packageB = packageRow("pkg-b", "SAMPLE Package B");

const solution0334: Solution = { internal_code: "0334", orientation: "Wall" };

/** One planned use of a solution: the package, the code, how many, and quantity of Sample Sealant A each. */
type Plan = [packageId: string, code: string, count: number, quantityEach: string];

/** Builds the check's input for Sample Sealant A from a list of planned uses. */
function inputFor(plans: Plan[], onHand: string): CheckInput {
  return {
    packages: [packageA, packageB].filter((row) => plans.some(([packageId]) => packageId === row.id)),
    installations: plans.map(([work_package_id, internal_code, installation_count], index) => ({
      id: `pi-${index}`,
      work_package_id,
      internal_code,
      installation_count,
    })),
    solutions: [],
    solution_products: plans.map(([, internal_code, , quantity_per_installation]) => ({
      internal_code,
      product_id: sealantA.id,
      quantity_per_installation,
    })),
    products: [sealantA],
    stock: [{ product_id: sealantA.id, quantity_on_hand: onHand }],
  };
}

function okResult(result: CheckResult) {
  if (result.outcome !== "ok") throw new Error(`Expected a result, got: ${result.problem}`);
  return result;
}

function sealantARow(result: CheckResult) {
  const row = okResult(result).combined.find((candidate) => candidate.product_id === sealantA.id);
  if (!row) throw new Error("No combined row for Sample Sealant A");
  return row;
}

describe("Combined calculation", () => {
  it("AC-06: 10 at 2 units and 5 at 1 unit, with stock of 20, gives required 25, on hand 20, shortfall 5 and Short", () => {
    const input = inputFor([["pkg-a", "0334", 10, "2"], ["pkg-a", "0335", 5, "1"]], "20");
    expect(sealantARow(checkPackages(input))).toEqual({
      product_id: "sealant-a",
      product: "Sample Sealant A",
      unit: "tube",
      required: "25",
      on_hand: "20",
      shortfall: "5",
      status: "Short",
    });
  });

  it("AC-07: required 25 with stock of 25 is Available, with no shortfall", () => {
    const row = sealantARow(checkPackages(inputFor([["pkg-a", "0334", 25, "1"]], "25")));
    expect(row.status).toBe("Available");
    expect(row.shortfall).toBeNull();
  });

  it("AC-08: required 1 with stock of 0 gives shortfall 1 and Short", () => {
    const row = sealantARow(checkPackages(inputFor([["pkg-a", "0334", 1, "1"]], "0")));
    expect(row.shortfall).toBe("1");
    expect(row.status).toBe("Short");
  });

  it("AC-09: 15 and 10 across two checked packages, with stock of 20, gives required 25, shortfall 5 and Short", () => {
    const input = inputFor([["pkg-a", "0334", 15, "1"], ["pkg-b", "0335", 10, "1"]], "20");
    const row = sealantARow(checkPackages(input));
    expect(row.required).toBe("25");
    expect(row.shortfall).toBe("5");
    expect(row.status).toBe("Short");
  });

  it("AC-10: only Package A checked gives required 15 and Available, with stock of 20", () => {
    const row = sealantARow(checkPackages(inputFor([["pkg-a", "0334", 15, "1"]], "20")));
    expect(row.required).toBe("15");
    expect(row.status).toBe("Available");
  });

  it("AC-11: 0.1 and 0.2 across two packages, with stock of 0.3, gives required 0.3 and Available", () => {
    const input = inputFor([["pkg-a", "0334", 1, "0.1"], ["pkg-b", "0335", 1, "0.2"]], "0.3");
    const row = sealantARow(checkPackages(input));
    expect(row.required).toBe("0.3");
    expect(row.status).toBe("Available");
    expect(row.shortfall).toBeNull();
  });

  it("AC-11: 3 at 0.335, with stock of 1.004, gives shortfall 0.001 and Short", () => {
    const row = sealantARow(checkPackages(inputFor([["pkg-a", "0334", 3, "0.335"]], "1.004")));
    expect(row.required).toBe("1.005");
    expect(row.shortfall).toBe("0.001");
    expect(row.status).toBe("Short");
  });

  it("AC-11: the largest valid quantity, with the same stock, is Available", () => {
    const row = sealantARow(checkPackages(inputFor([["pkg-a", "0334", 1, "999999999.999"]], "999999999.999")));
    expect(row.required).toBe("999999999.999");
    expect(row.status).toBe("Available");
  });

  it("AC-11: quantities as the database returns them are shown without trailing zeros", () => {
    const row = sealantARow(checkPackages(inputFor([["pkg-a", "0334", 10, "2.000"]], "20.500")));
    expect(row.required).toBe("20");
    expect(row.on_hand).toBe("20.5");
  });

  it("AC-32: 2 at 3 of 9998, missing from the catalogue, and 5 at 2 of 0334 give required 16", () => {
    const input = inputFor([["pkg-a", "9998", 2, "3"], ["pkg-a", "0334", 5, "2"]], "20");
    input.solutions = [solution0334];
    expect(sealantARow(checkPackages(input)).required).toBe("16");
  });

  it("FR-3: a solution with two mapped products adds to both", () => {
    const input = inputFor([["pkg-a", "0334", 2, "3"]], "20");
    input.products.push(sealantB);
    input.solution_products.push({ internal_code: "0334", product_id: sealantB.id, quantity_per_installation: "5" });
    input.stock.push({ product_id: sealantB.id, quantity_on_hand: "50" });
    const { combined } = okResult(checkPackages(input));
    expect(combined.find((row) => row.product_id === sealantA.id)?.required).toBe("6");
    expect(combined.find((row) => row.product_id === sealantB.id)?.required).toBe("10");
  });

  it("FR-3: a product the checked packages don't need has no combined row", () => {
    const input = inputFor([["pkg-a", "0334", 1, "1"]], "20");
    input.products.push(sealantB);
    input.stock.push({ product_id: sealantB.id, quantity_on_hand: "50" });
    const { combined } = okResult(checkPackages(input));
    expect(combined.map((row) => row.product_id)).toEqual([sealantA.id]);
  });
});

describe("Per-package detail", () => {
  it("Design section 8: keeps each package's own required quantity", () => {
    const input = inputFor([["pkg-a", "0334", 15, "1"], ["pkg-b", "0335", 10, "1"]], "20");
    const { packages } = okResult(checkPackages(input));
    expect(packages.map((row) => [row.id, row.required])).toEqual([
      ["pkg-a", [{ product_id: sealantA.id, required: "15" }]],
      ["pkg-b", [{ product_id: sealantA.id, required: "10" }]],
    ]);
  });

  it("AC-31: 2 at 3 of 9998, missing from the catalogue, has blank details and required 6", () => {
    const input = inputFor([["pkg-a", "9998", 2, "3"]], "20");
    const [row] = okResult(checkPackages(input)).packages;
    expect(row.installations[0].internal_code).toBe("9998");
    expect(row.installations[0].solution).toBeNull();
    expect(row.required).toEqual([{ product_id: sealantA.id, required: "6" }]);
  });

  it("FR-4: a planned code in the catalogue carries its details", () => {
    const input = inputFor([["pkg-a", "0334", 1, "1"]], "20");
    input.solutions = [solution0334];
    const [row] = okResult(checkPackages(input)).packages;
    expect(row.installations[0].solution).toEqual(solution0334);
  });
});

describe("FR-4: order of products", () => {
  const products = ["Alpha", "Beta", "Zeta"].map((name) => ({ id: name.toLowerCase(), name, unit: "tube" }));

  /** Package A needs Zeta and Beta; Package B, starting on the given date, needs Alpha. */
  function orderInput(packageBStart: string): CheckInput {
    return {
      packages: [packageA, { ...packageB, start_date: packageBStart }],
      installations: [
        { id: "pi-1", work_package_id: "pkg-a", internal_code: "0334", installation_count: 1 },
        { id: "pi-2", work_package_id: "pkg-b", internal_code: "0335", installation_count: 1 },
      ],
      solutions: [],
      solution_products: [
        { internal_code: "0334", product_id: "zeta", quantity_per_installation: "1" },
        { internal_code: "0334", product_id: "beta", quantity_per_installation: "1" },
        { internal_code: "0335", product_id: "alpha", quantity_per_installation: "1" },
      ],
      products,
      stock: products.map((product) => ({ product_id: product.id, quantity_on_hand: "5" })),
    };
  }

  it("combined rows follow the earliest start date of the packages needing them", () => {
    const { combined } = okResult(checkPackages(orderInput("2026-11-20")));
    expect(combined.map((row) => row.product)).toEqual(["Beta", "Zeta", "Alpha"]);
  });

  it("combined rows with the same start date follow product name", () => {
    const { combined } = okResult(checkPackages(orderInput(packageA.start_date)));
    expect(combined.map((row) => row.product)).toEqual(["Alpha", "Beta", "Zeta"]);
  });

  it("each package's products follow product name", () => {
    const [row] = okResult(checkPackages(orderInput("2026-11-20"))).packages;
    expect(row.required.map((entry) => entry.product_id)).toEqual(["beta", "zeta"]);
  });
});

describe("Design section 8: broken stored data never shows as zero", () => {
  it("a needed product with no product details is unavailable", () => {
    const input = inputFor([["pkg-a", "0334", 1, "1"]], "20");
    input.products = [];
    const result = checkPackages(input);
    expect(result.outcome).toBe("unavailable");
    expect(result).toHaveProperty("problem", expect.stringContaining("sealant-a"));
  });

  it("a needed product with no stock row is unavailable", () => {
    const input = inputFor([["pkg-a", "0334", 1, "1"]], "20");
    input.stock = [];
    const result = checkPackages(input);
    expect(result.outcome).toBe("unavailable");
    expect(result).toHaveProperty("problem", expect.stringContaining("sealant-a"));
  });

  it("a planned installation with no products is unavailable", () => {
    const input = inputFor([["pkg-a", "0334", 1, "1"]], "20");
    input.solution_products = [];
    const result = checkPackages(input);
    expect(result.outcome).toBe("unavailable");
    expect(result).toHaveProperty("problem", expect.stringContaining("0334"));
  });
});
