// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runCheck } from "../app/actions/run-check";
import type { CheckSuccess } from "../domain/check";
import { PackageList } from "./package-list";

vi.mock("../app/actions/run-check", () => ({ runCheck: vi.fn() }));
const runCheckMock = vi.mocked(runCheck);

const packageA = { id: "pkg-a", name: "SAMPLE Package A", site: "Site", start_date: "2026-11-08", crew: "Crew" };
const success: CheckSuccess = {
  outcome: "ok",
  combined: [{ product_id: "sealant-a", product: "Sample Sealant A", unit: "tube", required: "25", on_hand: "20", shortfall: "5", status: "Short" }],
  packages: [{ ...packageA, installations: [], required: [{ product_id: "sealant-a", required: "25" }] }],
};

const tickBox = () => screen.getByRole<HTMLInputElement>("checkbox", { name: "SAMPLE Package A" });

function tickAndCheck() {
  render(<PackageList packages={[packageA]} />);
  fireEvent.click(tickBox());
  fireEvent.click(screen.getByRole("button", { name: "Check" }));
}

beforeEach(() => {
  runCheckMock.mockReset();
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close() {
    this.open = false;
  };
});
afterEach(cleanup);

describe("Check flow", () => {
  it("FR-2: Check sends the ticked packages and opens the dialog", async () => {
    runCheckMock.mockResolvedValue(success);
    tickAndCheck();
    expect(await screen.findByRole("dialog")).toBeTruthy();
    expect(runCheckMock).toHaveBeenCalledWith(["pkg-a"]);
  });

  it("AC-03: after closing the dialog, the dashboard shows no status or Export, and the tick is kept", async () => {
    runCheckMock.mockResolvedValue(success);
    tickAndCheck();
    await screen.findByRole("dialog");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByText("Short")).toBeNull();
    expect(screen.queryByText("Available")).toBeNull();
    expect(screen.queryByRole("button", { name: "Export" })).toBeNull();
    expect(tickBox().checked).toBe(true);
  });

  it("AC-27: when the database is unavailable, an error and a retry appear, with no result or Export", async () => {
    runCheckMock.mockResolvedValue({ outcome: "unavailable" });
    tickAndCheck();
    expect((await screen.findByRole("alert")).textContent).toContain("The check could not be completed");
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByRole("button", { name: "Export" })).toBeNull();
    expect(tickBox().checked).toBe(true);
  });

  it("AC-27: losing the connection during the check gives the same error", async () => {
    runCheckMock.mockRejectedValue(new Error("Failed to fetch"));
    tickAndCheck();
    expect((await screen.findByRole("alert")).textContent).toContain("The check could not be completed");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("AC-27: Retry runs the check again and shows the result", async () => {
    runCheckMock.mockResolvedValueOnce({ outcome: "unavailable" }).mockResolvedValueOnce(success);
    tickAndCheck();
    fireEvent.click(await screen.findByRole("button", { name: "Retry" }));
    expect(await screen.findByRole("dialog")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("Design section 12: a package that no longer exists asks the user to reload", async () => {
    runCheckMock.mockResolvedValue({ outcome: "invalid_selection" });
    tickAndCheck();
    expect((await screen.findByRole("alert")).textContent).toContain("Reload the dashboard");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByRole("button", { name: "Export" })).toBeNull();
  });
});
