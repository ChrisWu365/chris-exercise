import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkPackage } from "../domain/check";
import { addDays } from "../domain/dates";

export async function listPackages(client: SupabaseClient, today: string): Promise<WorkPackage[]> {
  const { data, error } = await client
    .from("work_packages")
    .select("id, name, site, crew, start_offset_days")
    .order("start_offset_days")
    .order("id");
  if (error) throw new Error(`Could not load work packages: ${error.message}`);
  return data.map(({ start_offset_days, ...row }) => ({ ...row, start_date: addDays(today, start_offset_days) }));
}
