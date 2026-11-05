// All required notice wording, in one place.
export function SampleDataNotice() {
  return <p>Packages, material mappings and stock are SAMPLE data.</p>;
}

export function ResultNotices() {
  return (
    <ul>
      <li>This is a projection against recorded stock for the selected packages only.</li>
      <li>Stock is not reserved.</li>
      <li>This is not a compliance statement.</li>
      <li>It covers materials only, not full site readiness.</li>
    </ul>
  );
}
