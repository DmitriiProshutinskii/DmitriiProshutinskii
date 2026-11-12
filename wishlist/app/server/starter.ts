import { starter } from "../src/lib/my-wishes"
import { MAX_IMAGE_BYTES, saveImage } from "./images"
import { safeFetch } from "./preview"
import { newToken, type Db, type Store } from "./store"

export interface PhotoJob {
  wishId: string
  url: string
}

/** First-start database filled with Dmitrii's list (src/lib/my-wishes.ts). Photos are fetched afterwards. */
export function starterDb(base: Db): { db: Db; photos: PhotoJob[] } {
  const now = new Date().toISOString()
  const themeIds = new Map(starter.themes.map((t) => [t.key, newToken(6)]))
  const photos: PhotoJob[] = []
  const db: Db = {
    ...base,
    title: starter.title,
    ownerName: starter.ownerName,
    params: starter.params.map((p) => ({ ...p })),
    themes: starter.themes.map((t) => ({
      id: themeIds.get(t.key)!,
      name: t.name,
      description: t.description,
      color: t.color,
      flag: "flag" in t ? t.flag : undefined,
      pledges: [],
    })),
    wishes: starter.wishes.map((w) => {
      const id = newToken(6)
      if (w.photoUrl) photos.push({ wishId: id, url: w.photoUrl })
      return {
        id,
        title: w.title,
        url: w.url,
        price: w.price,
        currency: "currency" in w ? w.currency : "RUB",
        priority: w.priority,
        multi: w.multi,
        themeIds: w.themes.map((k) => themeIds.get(k)).filter((x): x is string => !!x),
        note: w.note,
        photo: null,
        illustration: "illustration" in w ? w.illustration : null,
        createdAt: now,
        reservations: [],
      }
    }),
  }
  return { db, photos }
}

/** Downloads shop photos for the starter wishes one by one. Failures leave the wish without a photo. */
export async function downloadStarterPhotos(store: Store, dataDir: string, jobs: PhotoJob[]) {
  let ok = 0
  for (const job of jobs) {
    try {
      const img = await safeFetch(job.url, MAX_IMAGE_BYTES, "image/avif,image/webp,image/png,image/jpeg,image/*")
      const photo = await saveImage(dataDir, img.body)
      await store.mutate((db) => {
        const w = db.wishes.find((x) => x.id === job.wishId)
        if (w && !w.photo) w.photo = photo
      })
      ok++
    } catch (e) {
      console.warn(`Starter photo not downloaded (${new URL(job.url).hostname}): ${(e as Error).message}`)
    }
  }
  console.log(`Starter photos: ${ok} of ${jobs.length} downloaded`)
}
