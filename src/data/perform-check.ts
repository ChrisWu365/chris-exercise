import type { SupabaseClient } from "@supabase/supabase-js";
import { checkPackages, type CheckSuccess } from "../domain/check";
import { getCheckInputs } from "./check-inputs";

export type CheckOutcome = CheckSuccess | { outcome: "invalid_selection" } | { outcome: "unavailable" };

/** The input comes from the browser, so it is checked before use. Failure details stay on the server. */
export async function performCheck(client: SupabaseClient, packageIds: unknown, today: string): Promise<CheckOutcome> {
  if (!Array.isArray(packageIds) || packageIds.length === 0) return { outcome: "invalid_selection" };

  try {
    const input = await getCheckInputs(client, packageIds, today);
    if (input.packages.length !== new Set(packageIds).size) return { outcome: "invalid_selection" };

    const result = checkPackages(input);
    if (result.outcome === "ok") return result;
    console.error(result.problem);
  } catch (error) {
    console.error(error);
  }
  return { outcome: "unavailable" };
}
