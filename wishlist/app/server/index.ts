import { resolve } from "node:path"

import { serve } from "@hono/node-server"

import { createApp } from "./app"
import { downloadStarterPhotos, starterDb, type PhotoJob } from "./starter"
import { Store } from "./store"

const dataDir = resolve(process.env.DATA_DIR ?? "./data")
const staticDir = resolve(process.env.STATIC_DIR ?? "./dist")
const port = Number(process.env.PORT ?? 3000)
const ownerPassword = process.env.OWNER_PASSWORD ?? ""

if (ownerPassword.length < 8) {
  console.error("OWNER_PASSWORD must be set and at least 8 characters long")
  process.exit(1)
}

const store = new Store(dataDir)
// First start: fill the list from src/lib/my-wishes.ts unless STARTER_DATA=0.
let photoJobs: PhotoJob[] = []
const created = await store.load(
  process.env.STARTER_DATA === "0"
    ? undefined
    : (base) => {
        const s = starterDb(base)
        photoJobs = s.photos
        return s.db
      }
)
if (created) console.log(`New database created${photoJobs.length ? " with the starter list" : ""}`)

const app = createApp({
  store,
  dataDir,
  staticDir,
  ownerPassword,
  secureCookies: process.env.INSECURE_COOKIES !== "1",
})

if (photoJobs.length) void downloadStarterPhotos(store, dataDir, photoJobs)

serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, (info) => {
  console.log(`Wishlist on http://localhost:${info.port}`)
  console.log(`Friends' link path: /f/${store.data.friendToken}`)
})
