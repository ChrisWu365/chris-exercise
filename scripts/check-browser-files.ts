// Fails if a database credential or address reaches the files sent to the browser.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const directory = ".next/static";
if (!existsSync(directory)) throw new Error(`${directory} not found: run the build first`);

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const forbidden = ["service_role", SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY].filter(
  (value): value is string => Boolean(value),
);

const files = readdirSync(directory, { recursive: true, encoding: "utf8" })
  .map((file) => join(directory, file))
  .filter((file) => /\.(js|css|html|json|map)$/.test(file));

const leaks = files.filter((file) => {
  const content = readFileSync(file, "utf8");
  return forbidden.some((value) => content.includes(value));
});

if (leaks.length > 0) {
  console.error(`Credentials found in browser files:\n${leaks.join("\n")}`);
  process.exit(1);
}
console.log(`Checked ${files.length} browser files for ${forbidden.length} forbidden values.`);
