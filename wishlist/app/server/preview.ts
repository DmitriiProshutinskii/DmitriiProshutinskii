import { lookup } from "node:dns/promises"
import { isIP } from "node:net"

/** Rejects loopback, private, link-local and other non-public addresses (basic SSRF guard). */
function isPrivate(ip: string) {
  if (ip.includes(":")) {
    const v = ip.toLowerCase()
    if (v.startsWith("::ffff:")) return isPrivate(v.slice(7))
    return v === "::" || v === "::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80")
  }
  const [a, b] = ip.split(".").map(Number)
  return (
    a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224
  )
}

async function assertPublic(url: URL) {
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("bad_url")
  const host = url.hostname.replace(/^\[|\]$/g, "")
  const addrs = isIP(host) ? [{ address: host }] : await lookup(host, { all: true })
  if (!addrs.length || addrs.some((a) => isPrivate(a.address))) throw new Error("bad_url")
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"

/** fetch() that re-checks every redirect hop and caps the body size. */
export async function safeFetch(raw: string, maxBytes: number, accept: string) {
  let url = new URL(raw)
  for (let hop = 0; hop < 4; hop++) {
    await assertPublic(url)
    const res = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
      headers: { "user-agent": UA, accept, "accept-language": "ru-RU,ru;q=0.9" },
    })
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      url = new URL(res.headers.get("location")!, url)
      continue
    }
    if (!res.ok || !res.body) throw new Error("fetch_failed")
    const reader = res.body.getReader()
    const chunks: Uint8Array[] = []
    let size = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.length
      if (size > maxBytes) {
        await reader.cancel()
        break
      }
      chunks.push(value)
    }
    return { url, type: res.headers.get("content-type") ?? "", body: Buffer.concat(chunks) }
  }
  throw new Error("too_many_redirects")
}

const decode = (s: string) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim()

function meta(html: string, keys: string[]) {
  for (const key of keys) {
    const re = new RegExp(
      `<meta[^>]+(?:property|name|itemprop)=["']${key}["'][^>]*content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name|itemprop)=["']${key}["']`,
      "i"
    )
    const m = html.match(re)
    if (m) return decode(m[1] ?? m[2])
  }
  return undefined
}

/** Best effort: many marketplaces block bots, so any field can come back empty. */
export async function readPreview(link: string) {
  const page = await safeFetch(link, 1_500_000, "text/html,application/xhtml+xml")
  const html = page.body.toString("utf8")
  const title = meta(html, ["og:title", "twitter:title"]) ?? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]
  const image = meta(html, ["og:image", "og:image:url", "twitter:image", "image"])
  const priceRaw = meta(html, ["product:price:amount", "og:price:amount", "price"])
  const price = priceRaw ? Math.round(Number(priceRaw.replace(/[^\d.,]/g, "").replace(",", "."))) : undefined
  return {
    title: title ? decode(title).slice(0, 120) : undefined,
    image: image ? new URL(image, page.url).toString() : undefined,
    price: price && Number.isFinite(price) && price > 0 ? price : undefined,
  }
}
