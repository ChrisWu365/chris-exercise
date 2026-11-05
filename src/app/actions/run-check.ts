"use server";

import { createServerClient } from "../../data/client";
import { performCheck, type CheckOutcome } from "../../data/perform-check";
import { aucklandToday } from "../../domain/dates";

export async function runCheck(packageIds: string[]): Promise<CheckOutcome> {
  return performCheck(createServerClient(), packageIds, aucklandToday(new Date()));
}
