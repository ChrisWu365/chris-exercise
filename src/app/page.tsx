import { PackageList, PackagesUnavailable } from "@/components/package-list";
import { createServerClient } from "@/data/client";
import { listPackages } from "@/data/packages";
import { aucklandToday } from "@/domain/dates";

// Read on every request, so a failed read is never served as a cached success.
export const dynamic = "force-dynamic";

async function loadPackages() {
  try {
    return await listPackages(createServerClient(), aucklandToday(new Date()));
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function DashboardPage() {
  const packages = await loadPackages();

  return (
    <main>
      <h1>Planned work packages</h1>
      <p>Packages, material mappings and stock are SAMPLE data.</p>
      {packages ? <PackageList packages={packages} /> : <PackagesUnavailable />}
    </main>
  );
}
