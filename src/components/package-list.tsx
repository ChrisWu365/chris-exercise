"use client";

import { useState } from "react";
import { runCheck } from "../app/actions/run-check";
import type { CheckOutcome } from "../data/perform-check";
import type { WorkPackage } from "../domain/check";
import { formatDate } from "../domain/dates";
import { ResultsDialog } from "./results-dialog";
import styles from "./tables.module.css";

export function PackageList({ packages }: { packages: WorkPackage[] }) {
  const [ticked, setTicked] = useState<ReadonlySet<string>>(new Set());
  const [checking, setChecking] = useState(false);
  const [outcome, setOutcome] = useState<CheckOutcome | null>(null);

  if (packages.length === 0) return <p>No planned work packages</p>;

  function toggle(id: string) {
    const next = new Set(ticked);
    if (!next.delete(id)) next.add(id);
    setTicked(next);
  }

  async function check() {
    setChecking(true);
    setOutcome(null);
    try {
      setOutcome(await runCheck([...ticked]));
    } catch (error) {
      console.error(error);
      setOutcome({ outcome: "unavailable" });
    } finally {
      setChecking(false);
    }
  }

  return (
    <>
      <div className={styles.scroll}>
        <table className={styles.table}>
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
      </div>
      <button type="button" disabled={ticked.size === 0 || checking} onClick={check}>
        Check
      </button>
      {outcome?.outcome === "unavailable" && (
        <div role="alert">
          <p>The check could not be completed.</p>
          <button type="button" disabled={checking} onClick={check}>
            Retry
          </button>
        </div>
      )}
      {outcome?.outcome === "invalid_selection" && (
        <p role="alert">A ticked package no longer exists. Reload the dashboard.</p>
      )}
      {outcome?.outcome === "ok" && <ResultsDialog result={outcome} onClose={() => setOutcome(null)} />}
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
