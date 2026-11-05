"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import type { CheckSuccess, CombinedRow, PackageResult } from "../domain/check";
import { formatDate } from "../domain/dates";
import { ResultNotices, SampleDataNotice } from "./notices";
import styles from "./tables.module.css";

const productLabel = (row: CombinedRow) => `${row.product} (${row.unit})`;

const solutionColumns = [
  ["Supplier ref.", "supplier_ref_code"],
  ["Orientation", "orientation"],
  ["Substrate", "substrate"],
  ["Service type", "service_type"],
  ["Service size", "service_size"],
  ["Integrity", "integrity"],
  ["Insulation", "insulation"],
];

function Table({ headings, children }: { headings: string[]; children: ReactNode }) {
  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            {headings.map((heading) => (
              <th key={heading} scope="col">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Section({ heading, children }: { heading: string; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id}>
      <h3 id={id}>{heading}</h3>
      {children}
    </section>
  );
}

function PackageDetail({ workPackage, products }: { workPackage: PackageResult; products: Map<string, CombinedRow> }) {
  return (
    <Section heading={workPackage.name}>
      <p>
        {workPackage.site}, starts {formatDate(workPackage.start_date)}, {workPackage.crew}
      </p>
      <Table headings={["Internal code", ...solutionColumns.map(([heading]) => heading), "Installations"]}>
        {workPackage.installations.map((installation) => (
          <tr key={installation.id}>
            <td>{installation.internal_code}</td>
            {solutionColumns.map(([heading, column]) => (
              <td key={heading}>{installation.solution?.[column]}</td>
            ))}
            <td>{installation.installation_count}</td>
          </tr>
        ))}
      </Table>
      <Table headings={["Product", "Required"]}>
        {workPackage.required.map(({ product_id, required }) => (
          <tr key={product_id}>
            <td>{productLabel(products.get(product_id)!)}</td>
            <td>{required}</td>
          </tr>
        ))}
      </Table>
    </Section>
  );
}

export function ResultsDialog({ result, onClose }: { result: CheckSuccess; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const products = new Map(result.combined.map((row) => [row.product_id, row]));

  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);

  return (
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId} onClose={onClose}>
      <h2 id={titleId}>Material check</h2>
      <Section heading="Combined result">
        <Table headings={["Product", "Required", "On hand", "Shortfall", "Status"]}>
          {result.combined.map((row) => (
            <tr key={row.product_id}>
              <td>{productLabel(row)}</td>
              <td>{row.required}</td>
              <td>{row.on_hand}</td>
              <td>{row.shortfall}</td>
              <td className={row.status === "Short" ? styles.short : undefined}>{row.status}</td>
            </tr>
          ))}
        </Table>
      </Section>
      <SampleDataNotice />
      <ResultNotices />
      {result.packages.map((workPackage) => (
        <PackageDetail key={workPackage.id} workPackage={workPackage} products={products} />
      ))}
      <div className={styles.actions}>
        <button type="button">Export</button>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </dialog>
  );
}
