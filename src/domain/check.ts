// The material check: pure rules, with no framework or database imports.
import { fromThousandths, toThousandths } from "./quantity";

export type WorkPackage = { id: string; name: string; site: string; start_date: string; crew: string };
export type Product = { id: string; name: string; unit: string };
export type PlannedInstallation = { id: string; work_package_id: string; internal_code: string; installation_count: number };
export type SolutionProduct = { internal_code: string; product_id: string; quantity_per_installation: string };
export type Stock = { product_id: string; quantity_on_hand: string };
export type Solution = { internal_code: string } & Record<string, string | null>;

export type CheckInput = {
  packages: WorkPackage[];
  installations: PlannedInstallation[];
  solutions: Solution[];
  solution_products: SolutionProduct[];
  products: Product[];
  stock: Stock[];
};

export type CombinedRow = {
  product_id: string;
  product: string;
  unit: string;
  required: string;
  on_hand: string;
  shortfall: string | null;
  status: "Short" | "Available";
};

export type PackageResult = WorkPackage & {
  installations: (PlannedInstallation & { solution: Solution | null })[];
  required: { product_id: string; required: string }[];
};

export type CheckSuccess = { outcome: "ok"; combined: CombinedRow[]; packages: PackageResult[] };
export type CheckResult = CheckSuccess | { outcome: "unavailable"; problem: string };

const byName = (a: string, b: string) => a.localeCompare(b, "en");

/** Packages stay in the order given, which src/data sets. */
export function checkPackages(input: CheckInput): CheckResult {
  const productsById = new Map(input.products.map((product) => [product.id, product]));
  const stockByProduct = new Map(input.stock.map((row) => [row.product_id, row.quantity_on_hand]));
  const solutionsByCode = new Map(input.solutions.map((solution) => [solution.internal_code, solution]));

  const totals = new Map<string, { required: bigint; earliestStart: string }>();
  const packageTotals = new Map<string, Map<string, bigint>>();

  for (const workPackage of input.packages) {
    const ownTotals = new Map<string, bigint>();
    packageTotals.set(workPackage.id, ownTotals);

    for (const installation of input.installations) {
      if (installation.work_package_id !== workPackage.id) continue;
      const mapped = input.solution_products.filter((row) => row.internal_code === installation.internal_code);
      if (mapped.length === 0) {
        return { outcome: "unavailable", problem: `Planned solution ${installation.internal_code} has no mapped products.` };
      }

      for (const row of mapped) {
        const quantity = BigInt(installation.installation_count) * toThousandths(row.quantity_per_installation);
        ownTotals.set(row.product_id, (ownTotals.get(row.product_id) ?? 0n) + quantity);

        const total = totals.get(row.product_id);
        const earlier = total && byName(total.earliestStart, workPackage.start_date) < 0;
        totals.set(row.product_id, {
          required: (total?.required ?? 0n) + quantity,
          earliestStart: earlier ? total.earliestStart : workPackage.start_date,
        });
      }
    }
  }

  for (const productId of totals.keys()) {
    if (!productsById.has(productId) || !stockByProduct.has(productId)) {
      return { outcome: "unavailable", problem: `Product ${productId} has no stock row or product details.` };
    }
  }

  const combined = [...totals]
    .sort(
      ([a, totalA], [b, totalB]) =>
        byName(totalA.earliestStart, totalB.earliestStart) || byName(productsById.get(a)!.name, productsById.get(b)!.name),
    )
    .map(([productId, { required }]): CombinedRow => {
      const product = productsById.get(productId)!;
      const onHand = toThousandths(stockByProduct.get(productId)!);
      const short = required > onHand;
      return {
        product_id: productId,
        product: product.name,
        unit: product.unit,
        required: fromThousandths(required),
        on_hand: fromThousandths(onHand),
        shortfall: short ? fromThousandths(required - onHand) : null,
        status: short ? "Short" : "Available",
      };
    });

  return {
    outcome: "ok",
    combined,
    packages: input.packages.map((workPackage) => ({
      ...workPackage,
      installations: input.installations
        .filter((installation) => installation.work_package_id === workPackage.id)
        .map((installation) => ({ ...installation, solution: solutionsByCode.get(installation.internal_code) ?? null })),
      required: [...packageTotals.get(workPackage.id)!]
        .sort(([a], [b]) => byName(productsById.get(a)!.name, productsById.get(b)!.name))
        .map(([product_id, required]) => ({ product_id, required: fromThousandths(required) })),
    })),
  };
}
