import { existsSync } from "node:fs";
import path from "node:path";

// Lets server components fall back gracefully until an image is dropped into /public.
export function publicFileExists(src: string) {
  return existsSync(path.join(process.cwd(), "public", src));
}
