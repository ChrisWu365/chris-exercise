import { createClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { listPackages } from "./packages";

function clientReturning(status: number, body: unknown) {
  const fetchStub = vi.fn<typeof fetch>(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
  );
  const client = createClient("http://supabase.test", "test-key", {
    auth: { persistSession: false },
    global: { fetch: fetchStub },
  });
  return { client, fetchStub };
}

describe("Skeleton: listPackages", () => {
  it("reads work packages soonest first, with a stable order", async () => {
    const row = { id: "pkg-01", name: "SAMPLE Package A", site: "Site", crew: "Crew" };
    const { client, fetchStub } = clientReturning(200, [row]);

    await expect(listPackages(client)).resolves.toEqual([row]);

    const url = new URL(String(fetchStub.mock.calls[0][0]));
    expect(url.pathname).toBe("/rest/v1/work_packages");
    expect(url.searchParams.get("order")).toBe("start_offset_days.asc,id.asc");
  });

  it("throws when the database returns an error, rather than an empty list", async () => {
    const { client } = clientReturning(500, { message: "database unavailable" });

    await expect(listPackages(client)).rejects.toThrow("database unavailable");
  });
});
