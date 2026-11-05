import type { SupabaseClient } from "@supabase/supabase-js";

export type WorkPackage = { id: string; name: string; site: string; crew: string };

export async function listPackages(client: SupabaseClient): Promise<WorkPackage[]> {
  const { data, error } = await client
    .from("work_packages")
    .select("id, name, site, crew")
    .order("start_offset_days")
    .order("id");
  if (error) throw new Error(`Could not load work packages: ${error.message}`);
  return data;
}
