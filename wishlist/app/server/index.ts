import { resolve } from "node:path"

import { serve } from "@hono/node-server"

import { createApp } from "./app"
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
await store.load()

const app = createApp({
  store,
  dataDir,
  staticDir,
  ownerPassword,
  secureCookies: process.env.INSECURE_COOKIES !== "1",
})

serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, (info) => {
  console.log(`Wishlist on http://localhost:${info.port}`)
  console.log(`Friends' link path: /f/${store.data.friendToken}`)
})
