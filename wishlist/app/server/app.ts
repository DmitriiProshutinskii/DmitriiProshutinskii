import { createHmac, timingSafeEqual } from "node:crypto"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { Hono, type Context } from "hono"
import { bodyLimit } from "hono/body-limit"
import { deleteCookie, getCookie, setCookie } from "hono/cookie"
import { createMiddleware } from "hono/factory"
import { secureHeaders } from "hono/secure-headers"

import { COLORS, CURRENCIES, type Currency, type Param, type Priority, type ThemeColor, type WishlistView } from "../src/lib/types"
import { MAX_IMAGE_BYTES, removeImage, saveImage } from "./images"
import { readPreview, safeFetch } from "./preview"
import { sendFile } from "./static"
import { newToken, type Db, type Store, type StoredTheme, type StoredWish } from "./store"

export interface Config {
  store: Store
  dataDir: string
  staticDir: string
  ownerPassword: string
  /** Set the Secure flag on the session cookie (true behind HTTPS). */
  secureCookies: boolean
}

const COOKIE = "wl_owner"
const SESSION_DAYS = 180

class HttpError extends Error {
  constructor(
    readonly status: 400 | 401 | 403 | 404 | 409 | 413 | 422 | 502,
    readonly code: string
  ) {
    super(code)
  }
}

// ---------- validation ----------
const str = (v: unknown, max: number, field: string, required = false) => {
  if (v === undefined || v === null) v = ""
  if (typeof v !== "string") throw new HttpError(422, `invalid_${field}`)
  const s = v.trim()
  if (required && !s) throw new HttpError(422, `missing_${field}`)
  if (s.length > max) throw new HttpError(422, `too_long_${field}`)
  return s
}
const url = (v: unknown, field: string) => {
  const s = str(v, 2000, field)
  if (!s) return ""
  try {
    const u = new URL(s)
    if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error()
    return u.toString()
  } catch {
    throw new HttpError(422, `invalid_${field}`)
  }
}
const photoUrl = (v: unknown) => {
  if (v === null || v === undefined || v === "") return null
  const s = str(v, 2000, "photo")
  if (/^\/uploads\/[\w-]+\.(jpg|png|gif|webp|avif)$/.test(s)) return s
  return url(s, "photo")
}
const price = (v: unknown) => {
  if (v === null || v === undefined || v === "") return null
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0 || n > 100_000_000) throw new HttpError(422, "invalid_price")
  return Math.round(n * 100) / 100
}
const currency = (v: unknown): Currency => (CURRENCIES.includes(v as Currency) ? (v as Currency) : "RUB")
const priority = (v: unknown): Priority => {
  if (v === 1 || v === 2 || v === 3) return v
  throw new HttpError(422, "invalid_priority")
}
const color = (v: unknown): ThemeColor => {
  if (COLORS.includes(v as ThemeColor)) return v as ThemeColor
  throw new HttpError(422, "invalid_color")
}

function wishFromBody(b: Record<string, unknown>, db: Db) {
  const themeIds = Array.isArray(b.themeIds) ? b.themeIds.filter((id): id is string => typeof id === "string") : []
  return {
    title: str(b.title, 120, "title", true),
    url: url(b.url, "url"),
    price: price(b.price),
    currency: currency(b.currency),
    priority: priority(b.priority),
    multi: b.multi === true,
    themeIds: [...new Set(themeIds)].filter((id) => db.themes.some((t) => t.id === id)),
    note: str(b.note, 500, "note"),
    photo: photoUrl(b.photo),
  }
}

// ---------- views: what each role is allowed to see ----------
function ownerView(db: Db): WishlistView {
  return {
    title: db.title,
    ownerName: db.ownerName ?? "",
    params: db.params,
    themes: db.themes.map(({ pledges: _hidden, ...t }) => ({ ...t, pledges: [] })),
    wishes: db.wishes.map(({ reservations: _hidden, createdAt: _c, ...w }) => ({ ...w, reservations: [] })),
    friendPath: `/f/${db.friendToken}`,
  }
}

function friendView(db: Db, clientId: string): WishlistView {
  return {
    title: db.title,
    ownerName: db.ownerName ?? "",
    params: db.params,
    themes: db.themes.map((t) => ({
      ...t,
      pledges: t.pledges.map((p) => ({ id: p.id, by: p.by, text: p.text, mine: p.clientId === clientId })),
    })),
    wishes: db.wishes.map(({ createdAt: _c, ...w }) => ({
      ...w,
      reservations: w.reservations.map((r) => ({ id: r.id, by: r.by, note: r.note, mine: r.clientId === clientId })),
    })),
  }
}

const findWish = (db: Db, id: string): StoredWish => {
  const w = db.wishes.find((x) => x.id === id)
  if (!w) throw new HttpError(404, "wish_not_found")
  return w
}
const findTheme = (db: Db, id: string): StoredTheme => {
  const t = db.themes.find((x) => x.id === id)
  if (!t) throw new HttpError(404, "theme_not_found")
  return t
}

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

async function json(c: Context): Promise<Record<string, unknown>> {
  try {
    const b = await c.req.json()
    if (b && typeof b === "object" && !Array.isArray(b)) return b
  } catch {
    /* fallthrough */
  }
  throw new HttpError(400, "invalid_json")
}

export function createApp(cfg: Config) {
  const { store, dataDir } = cfg
  const app = new Hono<{ Variables: { clientId: string } }>()

  // Changing OWNER_PASSWORD invalidates existing sessions because it is part of the signature.
  const sign = (exp: number) =>
    createHmac("sha256", store.data.sessionSecret).update(`owner:${exp}:${cfg.ownerPassword}`).digest("base64url")
  const validSession = (cookie: string | undefined) => {
    if (!cookie) return false
    const [exp, sig] = cookie.split(".")
    return Number(exp) > Date.now() && !!sig && safeEqual(sig, sign(Number(exp)))
  }

  app.use(
    "*",
    secureHeaders({
      referrerPolicy: "no-referrer",
      crossOriginResourcePolicy: false,
      contentSecurityPolicy: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", "data:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
      },
    })
  )

  app.onError((err, c) => {
    if (err instanceof HttpError) return c.json({ error: err.code }, err.status)
    console.error(err)
    return c.json({ error: "server_error" }, 500)
  })

  app.use("/api/*", async (c, next) => {
    await next()
    c.header("cache-control", "no-store")
  })

  const smallBody = bodyLimit({ maxSize: 64 * 1024, onError: (c) => c.json({ error: "too_large" }, 413) })

  // ---------- owner ----------
  app.post("/api/owner/login", smallBody, async (c) => {
    const b = await json(c)
    const password = typeof b.password === "string" ? b.password : ""
    if (!cfg.ownerPassword || !safeEqual(password, cfg.ownerPassword)) {
      await new Promise((r) => setTimeout(r, 600))
      throw new HttpError(401, "wrong_password")
    }
    const exp = Date.now() + SESSION_DAYS * 864e5
    setCookie(c, COOKIE, `${exp}.${sign(exp)}`, {
      httpOnly: true,
      secure: cfg.secureCookies,
      sameSite: "Lax",
      path: "/",
      maxAge: SESSION_DAYS * 86400,
    })
    return c.json({ ok: true })
  })

  app.post("/api/owner/logout", (c) => {
    deleteCookie(c, COOKIE, { path: "/" })
    return c.json({ ok: true })
  })

  const owner = createMiddleware(async (c, next) => {
    if (!validSession(getCookie(c, COOKIE))) throw new HttpError(401, "unauthorized")
    // Same-site check for state-changing requests (cookie is SameSite=Lax, this adds belt and braces).
    const origin = c.req.header("origin")
    if (c.req.method !== "GET" && origin && new URL(origin).host !== c.req.header("host")) throw new HttpError(403, "bad_origin")
    await next()
  })

  app.get("/api/owner", owner, (c) => c.json(ownerView(store.data)))

  app.put("/api/owner/settings", owner, smallBody, async (c) => {
    const b = await json(c)
    const rawParams = Array.isArray(b.params) ? b.params : []
    if (rawParams.length > 30) throw new HttpError(422, "too_many_params")
    const params: Param[] = rawParams
      .map((p: { label?: unknown; value?: unknown }) => ({ label: str(p?.label, 40, "param"), value: str(p?.value, 120, "param") }))
      .filter((p: Param) => p.label || p.value)
    const title = str(b.title, 60, "title", true)
    const ownerName = str(b.ownerName, 40, "owner_name")
    await store.mutate((db) => {
      db.params = params
      db.title = title
      db.ownerName = ownerName
    })
    return c.json(ownerView(store.data))
  })

  app.post("/api/owner/wishes", owner, smallBody, async (c) => {
    const b = await json(c)
    await store.mutate((db) => {
      if (db.wishes.length >= 500) throw new HttpError(422, "too_many_wishes")
      db.wishes.push({ id: newToken(6), ...wishFromBody(b, db), createdAt: new Date().toISOString(), reservations: [] })
    })
    return c.json(ownerView(store.data))
  })

  app.put("/api/owner/wishes/:id", owner, smallBody, async (c) => {
    const b = await json(c)
    let oldPhoto: string | null = null
    await store.mutate((db) => {
      const w = findWish(db, c.req.param("id"))
      const next = wishFromBody(b, db)
      if (w.photo !== next.photo) oldPhoto = w.photo
      // A wish that stops being multi keeps existing reservations; nobody new can join once taken.
      Object.assign(w, next)
    })
    await removeImage(dataDir, oldPhoto)
    return c.json(ownerView(store.data))
  })

  app.delete("/api/owner/wishes/:id", owner, async (c) => {
    const photo = await store.mutate((db) => {
      const w = findWish(db, c.req.param("id"))
      db.wishes = db.wishes.filter((x) => x !== w)
      return w.photo
    })
    await removeImage(dataDir, photo)
    return c.json(ownerView(store.data))
  })

  app.post("/api/owner/themes", owner, smallBody, async (c) => {
    const b = await json(c)
    await store.mutate((db) => {
      if (db.themes.length >= 50) throw new HttpError(422, "too_many_themes")
      db.themes.push({
        id: newToken(6),
        name: str(b.name, 40, "name", true),
        description: str(b.description, 300, "description"),
        color: color(b.color),
        pledges: [],
      })
    })
    return c.json(ownerView(store.data))
  })

  app.put("/api/owner/themes/:id", owner, smallBody, async (c) => {
    const b = await json(c)
    await store.mutate((db) => {
      const t = findTheme(db, c.req.param("id"))
      t.name = str(b.name, 40, "name", true)
      t.description = str(b.description, 300, "description")
      t.color = color(b.color)
    })
    return c.json(ownerView(store.data))
  })

  app.delete("/api/owner/themes/:id", owner, async (c) => {
    const id = c.req.param("id")
    await store.mutate((db) => {
      findTheme(db, id)
      db.themes = db.themes.filter((t) => t.id !== id)
      db.wishes.forEach((w) => (w.themeIds = w.themeIds.filter((x) => x !== id)))
    })
    return c.json(ownerView(store.data))
  })

  app.post("/api/owner/friend-link", owner, async (c) => {
    await store.mutate((db) => {
      db.friendToken = newToken()
    })
    return c.json(ownerView(store.data))
  })

  app.post(
    "/api/owner/upload",
    owner,
    bodyLimit({ maxSize: MAX_IMAGE_BYTES, onError: (c) => c.json({ error: "too_large" }, 413) }),
    async (c) => {
      const body = Buffer.from(await c.req.arrayBuffer())
      return c.json({ url: await saveImage(dataDir, body).catch(() => Promise.reject(new HttpError(422, "bad_image"))) })
    }
  )

  app.post("/api/owner/preview", owner, smallBody, async (c) => {
    const link = url((await json(c)).url, "url")
    if (!link) throw new HttpError(422, "missing_url")
    const p = await readPreview(link).catch(() => null)
    if (!p) return c.json({})
    let photo: string | undefined
    if (p.image) {
      // Keep a copy: shop CDNs often refuse images embedded on other sites.
      const img = await safeFetch(p.image, MAX_IMAGE_BYTES, "image/*").catch(() => null)
      if (img && img.body.length < MAX_IMAGE_BYTES) photo = await saveImage(dataDir, img.body).catch(() => undefined)
    }
    return c.json({ title: p.title, price: p.price, currency: p.currency, photo })
  })

  // ---------- friends ----------
  const friend = createMiddleware<{ Variables: { clientId: string } }>(async (c, next) => {
    const token = c.req.param("token") ?? ""
    if (!safeEqual(token, store.data.friendToken)) throw new HttpError(404, "list_not_found")
    const clientId = c.req.header("x-client-id") ?? ""
    if (!/^[\w-]{16,64}$/.test(clientId)) throw new HttpError(400, "missing_client_id")
    c.set("clientId", clientId)
    await next()
  })

  app.get("/api/f/:token", friend, (c) => c.json(friendView(store.data, c.get("clientId"))))

  app.post("/api/f/:token/wishes/:id/reservations", friend, smallBody, async (c) => {
    const b = await json(c)
    const clientId = c.get("clientId")
    await store.mutate((db) => {
      const w = findWish(db, c.req.param("id"))
      if (!w.multi && w.reservations.length) throw new HttpError(409, "already_taken")
      if (w.reservations.some((r) => r.clientId === clientId)) throw new HttpError(409, "already_yours")
      if (w.reservations.length >= 50) throw new HttpError(422, "too_many")
      w.reservations.push({
        id: newToken(6),
        by: str(b.by, 40, "name", true),
        note: str(b.note, 300, "note"),
        clientId,
        createdAt: new Date().toISOString(),
      })
    })
    return c.json(friendView(store.data, clientId))
  })

  app.delete("/api/f/:token/wishes/:id/reservations/:rid", friend, async (c) => {
    const clientId = c.get("clientId")
    await store.mutate((db) => {
      const w = findWish(db, c.req.param("id"))
      const r = w.reservations.find((x) => x.id === c.req.param("rid"))
      if (!r) throw new HttpError(404, "reservation_not_found")
      if (r.clientId !== clientId) throw new HttpError(403, "not_yours")
      w.reservations = w.reservations.filter((x) => x !== r)
    })
    return c.json(friendView(store.data, clientId))
  })

  app.post("/api/f/:token/themes/:id/pledges", friend, smallBody, async (c) => {
    const b = await json(c)
    const clientId = c.get("clientId")
    await store.mutate((db) => {
      const t = findTheme(db, c.req.param("id"))
      if (t.pledges.length >= 100) throw new HttpError(422, "too_many")
      t.pledges.push({
        id: newToken(6),
        by: str(b.by, 40, "name", true),
        text: str(b.text, 140, "text", true),
        clientId,
        createdAt: new Date().toISOString(),
      })
    })
    return c.json(friendView(store.data, clientId))
  })

  app.delete("/api/f/:token/themes/:id/pledges/:pid", friend, async (c) => {
    const clientId = c.get("clientId")
    await store.mutate((db) => {
      const t = findTheme(db, c.req.param("id"))
      const p = t.pledges.find((x) => x.id === c.req.param("pid"))
      if (!p) throw new HttpError(404, "pledge_not_found")
      if (p.clientId !== clientId) throw new HttpError(403, "not_yours")
      t.pledges = t.pledges.filter((x) => x !== p)
    })
    return c.json(friendView(store.data, clientId))
  })

  app.all("/api/*", (c) => c.json({ error: "not_found" }, 404))

  // ---------- files ----------
  const forever = "public, max-age=31536000, immutable"
  app.get("/uploads/:name", (c) => sendFile(c, join(dataDir, "uploads"), c.req.param("name"), forever))
  app.get("/assets/*", (c) => sendFile(c, cfg.staticDir, c.req.path.slice(1), forever))
  app.get("/favicon.svg", (c) => sendFile(c, cfg.staticDir, "favicon.svg", "public, max-age=86400"))
  app.all("/uploads/*", (c) => c.text("Not found", 404))

  // SPA: every other GET returns index.html (owner at /, friends at /f/<token>).
  let indexHtml: string | null = null
  app.get("*", async (c) => {
    indexHtml ??= await readFile(join(cfg.staticDir, "index.html"), "utf8")
    c.header("cache-control", "no-cache")
    return c.html(indexHtml)
  })

  return app
}
