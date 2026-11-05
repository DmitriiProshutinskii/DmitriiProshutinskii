import { randomBytes } from "node:crypto"
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { join } from "node:path"

import type { Currency, Param, Priority, ThemeColor } from "../src/lib/types"

export interface StoredReservation {
  id: string
  by: string
  note: string
  clientId: string
  createdAt: string
}

export interface StoredPledge {
  id: string
  by: string
  text: string
  clientId: string
  createdAt: string
}

export interface StoredWish {
  id: string
  title: string
  url: string
  price: number | null
  currency?: Currency
  priority: Priority
  multi: boolean
  themeIds: string[]
  note: string
  photo: string | null
  createdAt: string
  reservations: StoredReservation[]
}

export interface StoredTheme {
  id: string
  name: string
  description: string
  color: ThemeColor
  pledges: StoredPledge[]
}

export interface Db {
  version: 1
  title: string
  ownerName: string
  friendToken: string
  sessionSecret: string
  params: Param[]
  themes: StoredTheme[]
  wishes: StoredWish[]
}

export const newToken = (bytes = 9) => randomBytes(bytes).toString("base64url")

const empty = (): Db => ({
  version: 1,
  title: "Мой вишлист",
  ownerName: "",
  friendToken: newToken(),
  sessionSecret: randomBytes(32).toString("hex"),
  params: [],
  themes: [],
  wishes: [],
})

/** Whole database in one JSON file. Writes are serialised and atomic (temp file + rename). */
export class Store {
  private db!: Db
  private queue: Promise<unknown> = Promise.resolve()
  private readonly file: string

  constructor(private readonly dir: string) {
    this.file = join(dir, "db.json")
  }

  async load() {
    await mkdir(join(this.dir, "uploads"), { recursive: true })
    try {
      this.db = JSON.parse(await readFile(this.file, "utf8"))
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e
      this.db = empty()
      await this.persist()
    }
  }

  get data(): Readonly<Db> {
    return this.db
  }

  /** Runs `fn` on a copy, saves it, and only then makes it current. */
  mutate<T>(fn: (db: Db) => T): Promise<T> {
    const run = this.queue.then(async () => {
      const draft: Db = structuredClone(this.db)
      const result = fn(draft)
      const prev = this.db
      this.db = draft
      try {
        await this.persist()
      } catch (e) {
        this.db = prev
        throw e
      }
      return result
    })
    this.queue = run.catch(() => undefined)
    return run
  }

  private async persist() {
    const tmp = this.file + ".tmp"
    await writeFile(tmp, JSON.stringify(this.db, null, 2))
    await rename(tmp, this.file)
  }
}
