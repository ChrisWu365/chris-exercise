import type { SupabaseClient } from "@supabase/supabase-js";
import type { CheckInput, PlannedInstallation, Product, Solution, SolutionProduct, Stock } from "../domain/check";
import { addDays } from "../domain/dates";

const solutionColumns =
  "internal_code, supplier_ref_code, supplier, orientation, substrate, service_classification, service_type, service_size, integrity, insulation, service_type_option, substrate_option";

function rowsOf<Row>({ data, error }: { data: unknown; error: { message: string } | null }): Row[] {
  if (error) throw new Error(`Could not load the check's data: ${error.message}`);
  return data as Row[];
}

/** Quantities are cast to text so they never become JavaScript numbers. */
export async function getCheckInputs(client: SupabaseClient, packageIds: string[], today: string): Promise<CheckInput> {
  const [packageRows, installationRows] = await Promise.all([
    client
      .from("work_packages")
      .select("id, name, site, crew, start_offset_days")
      .in("id", packageIds)
      .order("start_offset_days")
      .order("id"),
    client
      .from("planned_installations")
      .select("id, work_package_id, internal_code, installation_count")
      .in("work_package_id", packageIds)
      .order("id"),
  ]);
  const installations = rowsOf<PlannedInstallation>(installationRows);
  const codes = [...new Set(installations.map((row) => row.internal_code))];

  const [solutionRows, solutionProductRows] = await Promise.all([
    client.from("solutions").select(solutionColumns).in("internal_code", codes),
    client
      .from("solution_products")
      .select("internal_code, product_id, quantity_per_installation::text")
      .in("internal_code", codes),
  ]);
  const solution_products = rowsOf<SolutionProduct>(solutionProductRows);
  const productIds = [...new Set(solution_products.map((row) => row.product_id))];

  const [productRows, stockRows] = await Promise.all([
    client.from("products").select("id, name, unit").in("id", productIds),
    client.from("stock").select("product_id, quantity_on_hand::text").in("product_id", productIds),
  ]);

  const packages = rowsOf<{ id: string; name: string; site: string; crew: string; start_offset_days: number }>(packageRows).map(
    ({ start_offset_days, ...row }) => ({ ...row, start_date: addDays(today, start_offset_days) }),
  );

  return {
    packages,
    installations,
    solutions: rowsOf<Solution>(solutionRows),
    solution_products,
    products: rowsOf<Product>(productRows),
    stock: rowsOf<Stock>(stockRows),
  };
}
