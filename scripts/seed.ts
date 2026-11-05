// Usage: npm run seed -- --target local|production|ci
// local and production read their service_role key from a git-ignored file.
// ci uses the throwaway database's disposable keys, already in the environment.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { parseSeedInput } from "./seed-input.ts";

const envFiles: Record<string, string | null> = {
  local: ".env.seed.local.local",
  production: ".env.seed.production.local",
  ci: null,
};

// In the order they are written; removals run in reverse, because of foreign keys.
const tables: [string, string[]][] = [
  ["solutions", ["internal_code"]],
  ["products", ["id"]],
  ["solution_products", ["internal_code", "product_id"]],
  ["work_packages", ["id"]],
  ["planned_installations", ["id"]],
  ["stock", ["product_id"]],
];

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

const csvText = readFileSync("data/source/solutions-excerpt.csv", "utf8");
const sample = JSON.parse(readFileSync("data/sample/sample-data.json", "utf8"));
const result = parseSeedInput(csvText, sample);
if (!result.ok) fail(`\n${result.errors.join("\n")}`);
for (const warning of result.warnings) console.warn(`Warning: ${warning}`);

const client = createClient(url, key, { auth: { persistSession: false } });

function check(error: { message: string } | null, action: string, table: string) {
  if (error) throw new Error(`Seed failed to ${action} ${table}: ${error.message}. Rerun it.`);
}

for (const [table, primaryKey] of [...tables].reverse()) {
  const wanted = new Set(result.rows[table].map((row) => primaryKey.map((column) => row[column]).join("|")));
  const { data, error } = await client.from(table).select(primaryKey.join(","));
  check(error, "read", table);
  const existing = (data ?? []) as unknown as Record<string, unknown>[];
  for (const row of existing) {
    if (wanted.has(primaryKey.map((column) => row[column]).join("|"))) continue;
    const removed = await client.from(table).delete().match(row);
    check(removed.error, "remove stale rows from", table);
  }
}

for (const [table] of tables) {
  const { error } = await client.from(table).upsert(result.rows[table]);
  check(error, "write", table);
  console.log(`Seeded ${result.rows[table].length} rows into ${table}.`);
}
console.log(`Finished seeding the ${target} database.`);
