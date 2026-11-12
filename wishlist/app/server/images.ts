import { randomUUID } from "node:crypto"
import { unlink, writeFile } from "node:fs/promises"
import { join } from "node:path"

const SIGNATURES: [string, (b: Buffer) => boolean][] = [
  ["jpg", (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff],
  ["png", (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))],
  ["gif", (b) => b.subarray(0, 4).toString("latin1") === "GIF8"],
  ["webp", (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP"],
  ["avif", (b) => b.subarray(4, 12).toString("latin1").startsWith("ftypavi")],
]

export const MAX_IMAGE_BYTES = 6 * 1024 * 1024

/** Saves an image after checking its magic bytes; returns the public URL. */
export async function saveImage(dataDir: string, body: Buffer) {
  if (!body.length || body.length > MAX_IMAGE_BYTES) throw new Error("bad_image")
  const ext = SIGNATURES.find(([, test]) => test(body))?.[0]
  if (!ext) throw new Error("bad_image")
  const name = `${randomUUID()}.${ext}`
  await writeFile(join(dataDir, "uploads", name), body)
  return `/uploads/${name}`
}

/** Removes a previously uploaded file; ignores external or missing ones. */
export async function removeImage(dataDir: string, url: string | null | undefined) {
  const m = url?.match(/^\/uploads\/([\w-]+\.(?:jpg|png|gif|webp|avif))$/)
  if (!m) return
  await unlink(join(dataDir, "uploads", m[1])).catch(() => undefined)
}
