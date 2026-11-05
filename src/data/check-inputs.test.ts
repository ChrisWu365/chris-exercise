import { createClient } from "@supabase/supabase-js";
import { expect, it } from "vitest";
import { getCheckInputs } from "./check-inputs";

it("throws when the database returns an error, rather than treating data as empty", async () => {
  const client = createClient("http://supabase.test", "test-key", {
    auth: { persistSession: false },
    global: {
      fetch: async () =>
        new Response(JSON.stringify({ message: "database unavailable" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }),
    },
  });

  await expect(getCheckInputs(client, ["pkg-a"], "2026-11-06")).rejects.toThrow("database unavailable");
});
