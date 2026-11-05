// Usage: npm run seed -- --target local|production|ci
// local and production read their service_role key from a git-ignored file.
// ci uses the throwaway database's disposable keys, already in the environment.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const envFiles: Record<string, string | null> = {
  local: ".env.seed.local.local",
  production: ".env.seed.production.local",
  ci: null,
};

function fail(message: string): never {
  console.error(`Seed aborted, nothing written: ${message}`);
  process.exit(1);
}

const target = process.argv[process.argv.indexOf("--target") + 1];
if (!process.argv.includes("--target") || !(target in envFiles)) {
  fail("name a target with --target local, production or ci");
}
const envFile = envFiles[target];
if (envFile) process.loadEnvFile(envFile);

const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env;
if (!url || !key) fail("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");

const sample = JSON.parse(readFileSync("data/sample/sample-data.json", "utf8"));
const rows = sample.work_packages;
if (!String(sample.label).startsWith("SAMPLE DATA")) fail("the file must be labelled SAMPLE DATA");
if (!Array.isArray(rows) || rows.length === 0) fail("work_packages must be a non-empty list");
if (new Set(rows.map((row) => row.id)).size !== rows.length) fail("work package IDs must be unique");
for (const row of rows) {
  const textValid = [row.id, row.name, row.site, row.crew].every((v) => typeof v === "string" && v);
  if (!textValid || !Number.isInteger(row.start_offset_days)) {
    fail(`work package ${JSON.stringify(row.id)} has a missing or invalid value`);
  }
}

const client = createClient(url, key, { auth: { persistSession: false } });
const upserted = await client.from("work_packages").upsert(rows);
if (upserted.error) throw new Error(`Seed failed: ${upserted.error.message}`);

const idList = `(${rows.map((row) => `"${row.id}"`).join(",")})`;
const removed = await client.from("work_packages").delete().not("id", "in", idList);
if (removed.error) throw new Error(`Seed failed: ${removed.error.message}`);

console.log(`Seeded ${rows.length} work packages into the ${target} database.`);
