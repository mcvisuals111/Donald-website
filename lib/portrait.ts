import { existsSync } from "node:fs";
import { join } from "node:path";

export const PORTRAIT_SRC = "/donald.jpg";

/**
 * The portrait is being sent separately. Until public/donald.jpg exists the
 * About section renders the empty panel at the same 4:5 ratio — no stock photo,
 * no avatar icon, no silhouette — and dropping the real file in place is the
 * only change needed. Evaluated on the server at build time.
 */
export const hasPortrait = existsSync(join(process.cwd(), "public", "donald.jpg"));
