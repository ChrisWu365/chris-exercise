import { createServerClient } from "@/data/client";
import { listPackages } from "@/data/packages";

// Read on every request, so a failed read is never served as a cached success.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const packages = await listPackages(createServerClient());

  return (
    <main>
      <h1>Planned work packages</h1>
      <p>Packages, material mappings and stock are SAMPLE data.</p>
      <table>
        <thead>
          <tr>
            <th scope="col">Package</th>
            <th scope="col">Site</th>
            <th scope="col">Crew</th>
          </tr>
        </thead>
        <tbody>
          {packages.map((workPackage) => (
            <tr key={workPackage.id}>
              <td>{workPackage.name}</td>
              <td>{workPackage.site}</td>
              <td>{workPackage.crew}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
