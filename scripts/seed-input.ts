// Validates the seed files and turns them into table rows, without touching a database.
import { parse } from "csv-parse/sync";

type Row = Record<string, unknown>;

export type SeedResult =
  | { ok: true; rows: Record<string, Row[]>; warnings: string[] }
  | { ok: false; errors: string[] };

const expectedSolutions = 148;

// numeric(12,3) would silently round extra decimals, so they must be rejected here.
const quantityFormat = /^\d{1,9}(\.\d{1,3})?$/;

const csvColumns: Record<string, string> = {
  "Internal Code": "internal_code",
  "Supplier Ref. Code": "supplier_ref_code",
  Supplier: "supplier",
  Orientation: "orientation",
  Substrate: "substrate",
  "Service Classification": "service_classification",
  "Service Type": "service_type",
  "Service Size": "service_size",
  Integrity: "integrity",
  Insulation: "insulation",
  "Service Type Option": "service_type_option",
  "Substrate Option": "substrate_option",
};

const clean = (value: string) => value.trim().replace(/\s+/g, " ");

function parseSolutions(csvText: string, errors: string[]): Row[] {
  const records: Record<string, string>[] = parse(csvText, { columns: true, skip_empty_lines: true, bom: true });
  if (records.length !== expectedSolutions) {
    errors.push(`The CSV must have ${expectedSolutions} rows, but has ${records.length}.`);
  }

  const seen = new Set<string>();
  return records.map((record, index) => {
    const row: Row = { raw_row: record };
    for (const [csvName, column] of Object.entries(csvColumns)) row[column] = clean(record[csvName] ?? "");

    const code = String(row.internal_code);
    if (!code) errors.push(`CSV row ${index + 1} has no internal code.`);
    else if (seen.has(code)) errors.push(`Duplicate internal code ${code} in the CSV.`);
    seen.add(code);

    row.substrate = String(row.substrate).replace(/,$/, "");
    // The word Blank means the value is empty rather than naming a service.
    row.service_type = row.service_type === "Blank" || row.service_type === "" ? null : row.service_type;
    return row;
  });
}

const isText = (value: unknown) => typeof value === "string" && value.length > 0;

function checkQuantity(value: unknown, allowZero: boolean) {
  return typeof value === "string" && quantityFormat.test(value) && (allowZero || Number(value) > 0);
}

export function parseSeedInput(csvText: string, sample: unknown): SeedResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const solutions = parseSolutions(csvText, errors);

  const file = (sample ?? {}) as Record<string, unknown>;
  if (!String(file.label).startsWith("SAMPLE DATA")) errors.push("The sample file must be labelled SAMPLE DATA.");
  const list = (name: string) => (Array.isArray(file[name]) ? (file[name] as Row[]) : []);
  const products = list("products");
  const solutionProducts = list("solution_products");
  const workPackages = list("work_packages");
  const planned = list("planned_installations");
  const stock = list("stock");

  const requireUnique = (rows: Row[], key: string, name: string) => {
    const values = rows.map((row) => row[key]);
    if (new Set(values).size !== values.length) errors.push(`Duplicate ${key} in ${name}.`);
  };
  requireUnique(products, "id", "products");
  requireUnique(workPackages, "id", "work_packages");
  requireUnique(planned, "id", "planned_installations");
  requireUnique(stock, "product_id", "stock");

  for (const row of products) {
    if (![row.id, row.name, row.unit].every(isText)) errors.push(`Product ${String(row.id)} has a missing value.`);
  }
  for (const row of workPackages) {
    const valid = [row.id, row.name, row.site, row.crew].every(isText) && Number.isInteger(row.start_offset_days);
    if (!valid) errors.push(`Work package ${String(row.id)} has a missing or invalid value.`);
  }

  const productIds = new Set(products.map((row) => row.id));
  for (const row of solutionProducts) {
    if (!isText(row.internal_code)) errors.push("A solution product has no internal_code.");
    if (!productIds.has(row.product_id)) errors.push(`Solution product ${String(row.internal_code)} names an unknown product.`);
    if (!checkQuantity(row.quantity_per_installation, false)) {
      errors.push(`Solution product ${String(row.internal_code)} has an invalid quantity_per_installation.`);
    }
  }
  for (const row of stock) {
    if (!productIds.has(row.product_id)) errors.push(`Stock names an unknown product ${String(row.product_id)}.`);
    if (!checkQuantity(row.quantity_on_hand, true)) {
      errors.push(`Stock for ${String(row.product_id)} has an invalid quantity_on_hand.`);
    }
  }
  const stocked = new Set(stock.map((row) => row.product_id));
  for (const product of products) {
    if (!stocked.has(product.id)) errors.push(`Product ${String(product.id)} has no stock row.`);
  }

  const packageIds = new Set(workPackages.map((row) => row.id));
  const mappedCodes = new Set(solutionProducts.map((row) => row.internal_code));
  for (const row of planned) {
    if (!packageIds.has(row.work_package_id)) errors.push(`Planned installation ${String(row.id)} names an unknown work package.`);
    if (!Number.isInteger(row.installation_count) || Number(row.installation_count) <= 0) {
      errors.push(`Planned installation ${String(row.id)} has an invalid installation_count.`);
    }
    if (!mappedCodes.has(row.internal_code)) {
      errors.push(`Planned installation ${String(row.id)} uses solution ${String(row.internal_code)}, which has no mapped products.`);
    }
  }
  const plannedPackages = new Set(planned.map((row) => row.work_package_id));
  for (const workPackage of workPackages) {
    if (!plannedPackages.has(workPackage.id)) errors.push(`Work package ${String(workPackage.id)} has no planned installations.`);
  }

  const catalogue = new Set(solutions.map((row) => row.internal_code));
  const plannedCodes = new Set(planned.map((row) => row.internal_code));
  for (const code of mappedCodes) {
    if (!catalogue.has(code) && !plannedCodes.has(code)) {
      warnings.push(`Solution product code ${String(code)} is in neither the catalogue nor a planned installation, so it may be mistyped.`);
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    warnings,
    rows: {
      solutions,
      products,
      solution_products: solutionProducts,
      work_packages: workPackages,
      planned_installations: planned,
      stock,
    },
  };
}
