"use client";

import { useState } from "react";
import type { WorkPackage } from "../domain/check";
import { formatDate } from "../domain/dates";

export function PackageList({ packages }: { packages: WorkPackage[] }) {
  const [ticked, setTicked] = useState<ReadonlySet<string>>(new Set());

  if (packages.length === 0) return <p>No planned work packages</p>;

  function toggle(id: string) {
    const next = new Set(ticked);
    if (!next.delete(id)) next.add(id);
    setTicked(next);
  }

  return (
    <>
      <table>
        <thead>
          <tr>
            <th scope="col">Tick</th>
            <th scope="col">Package</th>
            <th scope="col">Site</th>
            <th scope="col">Start date</th>
            <th scope="col">Crew</th>
          </tr>
        </thead>
        <tbody>
          {packages.map((workPackage) => (
            <tr key={workPackage.id}>
              <td>
                <input
                  type="checkbox"
                  aria-label={workPackage.name}
                  checked={ticked.has(workPackage.id)}
                  onChange={() => toggle(workPackage.id)}
                />
              </td>
              <th scope="row">{workPackage.name}</th>
              <td>{workPackage.site}</td>
              <td>{formatDate(workPackage.start_date)}</td>
              <td>{workPackage.crew}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" disabled={ticked.size === 0}>
        Check
      </button>
    </>
  );
}

export function PackagesUnavailable() {
  return (
    <div role="alert">
      <p>Packages could not be loaded.</p>
      {/* A plain form reloads the page, which reads the packages again. */}
      <form>
        <button type="submit">Retry</button>
      </form>
    </div>
  );
}
