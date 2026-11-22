// Creates `.env.local` from `.env.example` on a fresh clone, with a generated BETTER_AUTH_SECRET,
// so `pnpm dev` and `pnpm build` work straight after `pnpm install` (this runs from `prepare`).
// Never overwrites an existing `.env.local`. Skipped in CI and on Vercel: there a local file would
// silently fill in a variable that is missing from the real environment, and `next build` must fail.
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const EXAMPLE = ".env.example";
const TARGET = ".env.local";

function setupEnv(): void {
  // biome-ignore lint/style/noProcessEnv: install-time tooling, not app config; src/platform/env.ts is not loaded here.
  const { CI, VERCEL } = process.env;
  if (CI || VERCEL || existsSync(TARGET) || !existsSync(EXAMPLE)) return;

  const secret = randomBytes(32).toString("base64");
  const local = readFileSync(EXAMPLE, "utf8").replace(
    /^BETTER_AUTH_SECRET=.*$/m,
    `BETTER_AUTH_SECRET=${secret}`,
  );
  writeFileSync(TARGET, local, { flag: "wx", mode: 0o600 });
  process.stdout.write(`Created ${TARGET} from ${EXAMPLE} with a generated BETTER_AUTH_SECRET.\n`);
}

setupEnv();
