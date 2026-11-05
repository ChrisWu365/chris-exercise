// Fails if an acceptance criterion in the specification has no test with its ID in the title.
import { readdirSync, readFileSync } from "node:fs";

export function findUncovered(spec: string, testFiles: string[]): string[] {
  const criteria = [...spec.matchAll(/\*\*(AC-\d+)\*\*/g)].map((match) => match[1]);
  const titles = testFiles.flatMap((text) => [...text.matchAll(/\b(?:it|test)(?:\.each\([\s\S]*?\))?\(\s*["'`]([^"'`]*)/g)]);
  const covered = new Set(titles.flatMap((match) => match[1].match(/AC-\d+/g) ?? []));
  return criteria.filter((id) => !covered.has(id));
}

if (import.meta.main) {
  const testFiles = ["src", "tests", "e2e", "scripts"]
    .flatMap((dir) => readdirSync(dir, { recursive: true, encoding: "utf8" }).map((file) => `${dir}/${file}`))
    .filter((path) => /\.(test|spec)\.tsx?$/.test(path) && !path.includes("check-ac-coverage"));

  const uncovered = findUncovered(
    readFileSync("docs/02-slice-spec.md", "utf8"),
    testFiles.map((path) => readFileSync(path, "utf8")),
  );
  if (uncovered.length > 0) {
    console.error(`No test names these criteria: ${uncovered.join(", ")}`);
    process.exit(1);
  }
  console.log(`Every criterion has a test, across ${testFiles.length} test files.`);
}
