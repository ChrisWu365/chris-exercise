// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { WorkPackage } from "../domain/check";
import { PackageList, PackagesUnavailable } from "./package-list";

afterEach(cleanup);

const packageA: WorkPackage = {
  id: "pkg-a",
  name: "SAMPLE Package A",
  site: "SAMPLE Site North",
  start_date: "2026-11-08",
  crew: "SAMPLE Crew 1",
};

const checkButton = () => screen.getByRole("button", { name: "Check" });
const tickBox = () => screen.getByRole("checkbox", { name: "SAMPLE Package A" });

describe("Dashboard", () => {
  it("FR-1: a row shows a tick box, name, site, start date and crew", () => {
    render(<PackageList packages={[packageA]} />);
    const row = screen.getByRole("row", { name: /SAMPLE Package A/ });
    expect(within(row).getByRole("checkbox")).toBeTruthy();
    for (const text of ["SAMPLE Site North", "8 Nov 2026", "SAMPLE Crew 1"]) {
      expect(within(row).getByText(text)).toBeTruthy();
    }
  });

  it("AC-02: all 12 packages are listed, with no page controls", () => {
    const packages = Array.from({ length: 12 }, (_, index) => ({
      ...packageA,
      id: `pkg-${index}`,
      name: `SAMPLE Package ${index}`,
    }));
    render(<PackageList packages={packages} />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(12);
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual(["Check"]);
  });

  it("AC-04: a package starting on 2026-11-08 shows 8 Nov 2026", () => {
    render(<PackageList packages={[packageA]} />);
    expect(screen.getByText("8 Nov 2026")).toBeTruthy();
  });

  it("AC-05: Check is disabled when no package is ticked", () => {
    render(<PackageList packages={[packageA]} />);
    expect((checkButton() as HTMLButtonElement).disabled).toBe(true);
  });

  it("FR-2: Check is enabled once a package is ticked, and disabled again when it is unticked", () => {
    render(<PackageList packages={[packageA]} />);
    fireEvent.click(tickBox());
    expect((checkButton() as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(tickBox());
    expect((checkButton() as HTMLButtonElement).disabled).toBe(true);
  });

  it("AC-18: no Export button is shown", () => {
    render(<PackageList packages={[packageA]} />);
    expect(screen.queryByRole("button", { name: "Export" })).toBeNull();
  });

  it("AC-25: when packages can't load, an error and a retry appear and no list is shown", () => {
    render(<PackagesUnavailable />);
    expect(screen.getByRole("alert").textContent).toContain("Packages could not be loaded");
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("AC-26: with no packages, the message No planned work packages appears", () => {
    render(<PackageList packages={[]} />);
    expect(screen.getByText("No planned work packages")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });
});
