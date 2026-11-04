import { ApiError, type Backend } from "./backend"
import { seedParams, seedThemes, seedWishes } from "./seed"
import type { Role, Settings, Theme, Wish, WishlistView } from "./types"

/** In-memory stand-in for the server, used by the clickable preview. Mirrors what each role may see. */
interface DemoDb extends Settings {
  themes: Theme[]
  wishes: Wish[]
  friendPath: string
}

const db: DemoDb = {
  title: "Вишлист Димы",
  ownerName: "Дима",
  params: seedParams,
  themes: seedThemes,
  wishes: seedWishes,
  friendPath: "/f/k7q2x9demo",
}

let nextId = 1
const id = () => `demo${nextId++}`
const clone = <T,>(v: T): T => structuredClone(v)
const delay = () => new Promise((r) => setTimeout(r, 120))

function view(role: Role): WishlistView {
  const base = { title: db.title, ownerName: db.ownerName, params: clone(db.params) }
  if (role === "friend") return { ...base, themes: clone(db.themes), wishes: clone(db.wishes) }
  return {
    ...base,
    themes: db.themes.map((t) => ({ ...clone(t), pledges: [] })),
    wishes: db.wishes.map((w) => ({ ...clone(w), reservations: [] })),
    friendPath: db.friendPath,
  }
}

const findWish = (wishId: string) => {
  const w = db.wishes.find((x) => x.id === wishId)
  if (!w) throw new ApiError(404, "wish_not_found")
  return w
}
const findTheme = (themeId: string) => {
  const t = db.themes.find((x) => x.id === themeId)
  if (!t) throw new ApiError(404, "theme_not_found")
  return t
}

export function demoBackend(role: Role): Backend {
  const done = async () => {
    await delay()
    return view(role)
  }
  return {
    load: done,
    login: async () => undefined,
    logout: async () => undefined,
    addWish: (input) => {
      db.wishes.push({ ...input, id: id(), illustration: null, reservations: [] })
      return done()
    },
    updateWish: (wishId, input) => {
      Object.assign(findWish(wishId), input)
      return done()
    },
    deleteWish: (wishId) => {
      db.wishes = db.wishes.filter((w) => w.id !== wishId)
      return done()
    },
    addTheme: (input) => {
      db.themes.push({ ...input, id: id(), pledges: [] })
      return done()
    },
    deleteTheme: (themeId) => {
      db.themes = db.themes.filter((t) => t.id !== themeId)
      db.wishes.forEach((w) => (w.themeIds = w.themeIds.filter((x) => x !== themeId)))
      return done()
    },
    saveSettings: (s) => {
      Object.assign(db, s)
      return done()
    },
    rotateFriendLink: () => {
      db.friendPath = `/f/${Math.random().toString(36).slice(2, 12)}`
      return done()
    },
    uploadPhoto: (file) =>
      new Promise((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => resolve(String(r.result))
        r.onerror = () => reject(new ApiError(422, "bad_image"))
        r.readAsDataURL(file)
      }),
    // The preview has no server to fetch shop pages with.
    preview: async () => ({}),
    reserve: (wishId, by, note) => {
      const w = findWish(wishId)
      if (!w.multi && w.reservations.length) throw new ApiError(409, "already_taken")
      w.reservations.push({ id: id(), by, note, mine: true })
      return done()
    },
    unreserve: (wishId, rid) => {
      const w = findWish(wishId)
      w.reservations = w.reservations.filter((r) => r.id !== rid)
      return done()
    },
    pledge: (themeId, by, text) => {
      findTheme(themeId).pledges.push({ id: id(), by, text, mine: true })
      return done()
    },
    unpledge: (themeId, pid) => {
      const t = findTheme(themeId)
      t.pledges = t.pledges.filter((p) => p.id !== pid)
      return done()
    },
  }
}
