import { readFile, stat } from "node:fs/promises"
import { extname, join, normalize, sep } from "node:path"

import type { Context } from "hono"

const TYPES: Record<string, string> = {
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ico": "image/x-icon",
}

/** Serves `relPath` from inside `dir`, or 404. Rejects anything that escapes the directory. */
export async function sendFile(c: Context, dir: string, relPath: string, cache: string) {
  const full = normalize(join(dir, decodeURIComponent(relPath)))
  if (!full.startsWith(normalize(dir) + sep)) return c.text("Not found", 404)
  const type = TYPES[extname(full).toLowerCase()]
  if (!type) return c.text("Not found", 404)
  try {
    if (!(await stat(full)).isFile()) return c.text("Not found", 404)
    const body = await readFile(full)
    return c.body(body, 200, { "content-type": type, "cache-control": cache })
  } catch {
    return c.text("Not found", 404)
  }
}
