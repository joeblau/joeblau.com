# jb-f1

Next.js App Router app deployed with OpenNext to the Cloudflare Worker `jb-f1` at https://f1.joeblau.com.

From the repository root, install dependencies with `bun install`. Then, from this directory:

- `bun run dev` — Next.js development server at http://localhost:33006.
- `bun run lint` — ESLint.
- `bun run cf-typegen` — regenerate Cloudflare binding types.
- `bun run typecheck` — TypeScript validation.
- `bun run preview` — build and run in the local Workers runtime.
- `bun run deploy` — build and deploy to Cloudflare.

Copy `.dev.vars.example` to `.dev.vars` for local development. Cloudflare authentication is required for deployment (`bunx wrangler login`). The custom domain is configured in `wrangler.jsonc`.
