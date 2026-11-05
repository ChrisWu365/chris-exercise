// Builds the CSV snapshot from a check result, with no further data needed.
import type { CheckSuccess, CombinedRow } from "./check";

const notice = "SAMPLE DATA. Stock is not reserved. This is not a compliance statement.";

const header = [
  "exported_at",
  "package_name",
  "site",
  "start_date",
  "crew",
  "product",
  "unit",
  "package_required",
  "combined_required",
  "on_hand",
  "combined_shortfall",
  "status",
  "notice",
];

const aucklandTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "Pacific/Auckland",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  timeZoneName: "longOffset",
});

function toAucklandTimestamp(date: Date): string {
  const part = Object.fromEntries(aucklandTime.formatToParts(date).map(({ type, value }) => [type, value]));
  const offset = part.timeZoneName.replace("GMT", "");
  return `${part.year}-${part.month}-${part.day}T${part.hour}:${part.minute}:${part.second}${offset}`;
}

function toCell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

export function buildCsv(result: CheckSuccess, exportedAt: Date): string {
  const timestamp = toAucklandTimestamp(exportedAt);
  const combinedByProduct = new Map<string, CombinedRow>(result.combined.map((row) => [row.product_id, row]));

  const rows = result.packages.flatMap((workPackage) =>
    workPackage.required.map(({ product_id, required }) => {
      const combined = combinedByProduct.get(product_id)!;
      return [
        timestamp,
        workPackage.name,
        workPackage.site,
        workPackage.start_date,
        workPackage.crew,
        combined.product,
        combined.unit,
        required,
        combined.required,
        combined.on_hand,
        combined.shortfall ?? "",
        combined.status,
        notice,
      ];
    }),
  );

  return [header, ...rows].map((row) => row.map(toCell).join(",")).join("\r\n") + "\r\n";
}
