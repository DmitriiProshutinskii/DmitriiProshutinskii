import { demoPhoto } from "./demo-photos"
import { starter } from "./my-wishes"
import type { Param, Theme, Wish } from "./types"

// The clickable preview shows Dmitrii's real list (src/lib/my-wishes.ts) with nothing reserved yet.

export const seedTitle = starter.title
export const seedOwnerName = starter.ownerName
export const seedParams: Param[] = starter.params

export const seedThemes: Theme[] = starter.themes.map(({ key, ...t }) => ({ ...t, id: key, pledges: [] }))

/** Drawings shown when a shop photo is not available in this build. */
const FALLBACK_ART: Record<string, string> = { coffee: "beans" }

export const seedWishes: Wish[] = starter.wishes.map(({ key, themes, photoUrl: _remote, ...w }) => ({
  ...w,
  id: key,
  themeIds: themes,
  photo: demoPhoto(key),
  illustration: FALLBACK_ART[key] ?? null,
  reservations: [],
}))
