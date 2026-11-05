// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CheckSuccess, PackageResult } from "../domain/check";
import { ResultsDialog } from "./results-dialog";

const workPackage = (id: string, name: string, rest: Pick<PackageResult, "installations" | "required">): PackageResult => ({
  id,
  name,
  site: "SAMPLE Site North",
  start_date: "2026-11-08",
  crew: "SAMPLE Crew 1",
  ...rest,
});

const solution0334 = {
  internal_code: "0334",
  supplier_ref_code: "V1.11-22SFR00038-146-E",
  orientation: "Wall",
  substrate: "FR plasterboard",
  service_type: "Copper Pipe",
  service_size: "Ø100mm",
  integrity: "60",
  insulation: "-",
};

const result: CheckSuccess = {
  outcome: "ok",
  combined: [
    { product_id: "sealant-a", product: "Sample Sealant A", unit: "tube", required: "25", on_hand: "20", shortfall: "5", status: "Short" },
    { product_id: "sealant-b", product: "Sample Sealant B", unit: "tube", required: "2", on_hand: "50", shortfall: null, status: "Available" },
  ],
  packages: [
    workPackage("pkg-a", "SAMPLE Package A", {
      installations: [{ id: "pi-1", work_package_id: "pkg-a", internal_code: "0334", installation_count: 10, solution: solution0334 }],
      required: [{ product_id: "sealant-a", required: "19" }],
    }),
    workPackage("pkg-b", "SAMPLE Package B", {
      installations: [{ id: "pi-2", work_package_id: "pkg-b", internal_code: "9998", installation_count: 2, solution: null }],
      required: [
        { product_id: "sealant-a", required: "6" },
        { product_id: "sealant-b", required: "2" },
      ],
    }),
  ],
};

const cells = (row: HTMLElement) => Array.from(row.children).map((cell) => cell.textContent);
const region = (name: string) => within(screen.getByRole("region", { name }));

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close() {
    this.open = false;
  };
});
afterEach(cleanup);

function renderDialog() {
  const onClose = vi.fn();
  render(<ResultsDialog result={result} onClose={onClose} />);
  return { onClose, text: screen.getByRole("dialog").textContent ?? "" };
}

describe("Results dialog", () => {
  it("AC-12: the combined result appears above the package details", () => {
    renderDialog();
    const combined = screen.getByRole("region", { name: "Combined result" });
    const details = screen.getByRole("region", { name: "SAMPLE Package A" });
    expect(combined.compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("FR-4: a short product shows required, on hand, shortfall and Short", () => {
    renderDialog();
    const row = region("Combined result").getByRole("row", { name: /Sample Sealant A/ });
    expect(cells(row)).toEqual(["Sample Sealant A (tube)", "25", "20", "5", "Short"]);
  });

  it("AC-07: an Available product shows no shortfall", () => {
    renderDialog();
    const row = region("Combined result").getByRole("row", { name: /Sample Sealant B/ });
    expect(cells(row)).toEqual(["Sample Sealant B (tube)", "2", "50", "", "Available"]);
  });

  it("AC-16: the dialog says stock is not reserved", () => {
    expect(renderDialog().text).toContain("Stock is not reserved");
  });

  it.each([
    "SAMPLE data",
    "projection against recorded stock for the selected packages only",
    "not a compliance statement",
    "materials only, not full site readiness",
  ])("FR-6: the dialog says %s", (notice) => {
    expect(renderDialog().text).toContain(notice);
  });

  it("FR-6: allocated and held never appear, and reserved only in the statement that stock isn't", () => {
    const { text } = renderDialog();
    expect(text).not.toMatch(/allocated|held/i);
    expect(text.replaceAll("Stock is not reserved", "")).not.toMatch(/reserved/i);
  });

  it("FR-4: each package shows its installations' catalogue details, count and required quantities", () => {
    renderDialog();
    const packageA = region("SAMPLE Package A");
    expect(cells(packageA.getByRole("row", { name: /0334/ }))).toEqual([
      "0334",
      "V1.11-22SFR00038-146-E",
      "Wall",
      "FR plasterboard",
      "Copper Pipe",
      "Ø100mm",
      "60",
      "-",
      "10",
    ]);
    expect(cells(packageA.getByRole("row", { name: /Sample Sealant A/ }))).toEqual(["Sample Sealant A (tube)", "19"]);
  });

  it("AC-31: 9998, missing from the catalogue, shows blank details and required 6", () => {
    renderDialog();
    const packageB = region("SAMPLE Package B");
    expect(cells(packageB.getByRole("row", { name: /9998/ }))).toEqual(["9998", "", "", "", "", "", "", "", "2"]);
    expect(cells(packageB.getByRole("row", { name: /Sample Sealant A/ }))).toEqual(["Sample Sealant A (tube)", "6"]);
  });

  it("FR-5: the dialog has an Export button", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: "Export" })).toBeTruthy();
  });

  it("the Close button closes the dialog", () => {
    const { onClose } = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });
});
