# chris-exercise

Material readiness dashboard for construction team leaders. All packages, material mappings and stock are SAMPLE data. See [docs](docs) for the plan, specification, design and test strategy.

**Current state:** walking skeleton. The page lists work packages read from Supabase, with no material check yet.

## Run locally

Needs Node.js 24. The integration tests also need a Supabase database, which CI provides.

```sh
npm ci
cp .env.example .env.local          # then add the local Supabase project's URL and anon key
npx supabase link --project-ref <local-project-ref>
npx supabase db push
npm run seed -- --target local      # needs .env.seed.local.local, see .env.example
npm run dev
```

## Run the checks

```sh
npm run lint && npm run typecheck && npm test
npm run build && npx playwright install chromium && npm run test:e2e
```

## Set up deployment

Deployment runs from GitHub Actions on pushes to `main`, after all checks pass.

1. Link the production project and apply migrations, as above, using its project reference.
2. Create `.env.seed.production.local` with its URL and `service_role` key, then run `npm run seed -- --target production`. Production must be seeded before the first deployment, or the smoke test fails.
3. Create a Vercel project, without connecting it to Git. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` for production, using the production project's values.
4. In the GitHub repository's Actions settings, add:

| Type | Name | Value |
| --- | --- | --- |
| Secret | `SUPABASE_ACCESS_TOKEN` | Supabase personal access token |
| Secret | `SUPABASE_DB_PASSWORD` | Production database password |
| Secret | `VERCEL_TOKEN` | Vercel access token |
| Variable | `SUPABASE_PROJECT_REF` | Production project reference |
| Variable | `VERCEL_ORG_ID` | Vercel team or user ID |
| Variable | `VERCEL_PROJECT_ID` | Vercel project ID |
| Variable | `PRODUCTION_URL` | The site's public production URL |

The `service_role` key is never stored in GitHub or Vercel.
