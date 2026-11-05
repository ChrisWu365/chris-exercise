// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CheckSuccess } from "../domain/check";
import { ResultsDialog } from "./results-dialog";

const result: CheckSuccess = {
  outcome: "ok",
  combined: [{ product_id: "sealant-a", product: "Sample Sealant A", unit: "tube", required: "25", on_hand: "20", shortfall: "5", status: "Short" }],
  packages: [
    {
      id: "pkg-a",
      name: "SAMPLE Package A",
      site: "Site",
      start_date: "2026-11-08",
      crew: "Crew",
      installations: [],
      required: [{ product_id: "sealant-a", required: "25" }],
    },
  ],
};

const readText = (blob: Blob) =>
  new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(blob);
  });

const createObjectURL = vi.fn<(file: Blob) => string>(() => "blob:test");
const fetchSpy = vi.fn();
const clicked: { download: string; href: string }[] = [];

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };
  URL.createObjectURL = createObjectURL;
  URL.revokeObjectURL = vi.fn();
  vi.stubGlobal("fetch", fetchSpy);
  HTMLAnchorElement.prototype.click = function click() {
    clicked.push({ download: this.download, href: this.href });
  };
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  clicked.length = 0;
});

describe("Export", () => {
  it("AC-24: Export builds the file from the dialog's result, with no server request", async () => {
    render(<ResultsDialog result={result} onClose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Export" }));

    expect(clicked).toEqual([{ download: "material-check.csv", href: "blob:test" }]);
    expect(fetchSpy).not.toHaveBeenCalled();
    const file = createObjectURL.mock.calls[0][0];
    expect(file.type).toContain("text/csv");
    const text = await readText(file);
    expect(text).toContain("SAMPLE Package A");
    expect(text).toContain("25,25,20,5,Short");
  });
});
