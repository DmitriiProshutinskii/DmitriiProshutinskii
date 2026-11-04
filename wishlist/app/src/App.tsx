import { useMemo, useState } from "react"

import { Toaster } from "@/components/ui/sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginScreen } from "@/components/wish/login-screen"
import { WishlistPage, gutter } from "@/components/wish/wishlist-page"
import { useWishlist } from "@/hooks/use-wishlist"
import { FriendApi, OwnerApi } from "@/lib/backend"
import { demoBackend } from "@/lib/demo-backend"
import type { Role } from "@/lib/types"

const DEMO = import.meta.env.MODE === "artifact"

export default function App() {
  return (
    <>
      {DEMO ? <Demo /> : <Site />}
      <Toaster />
    </>
  )
}

/** Real site: /f/<token> is the friends' page, everything else is the owner's (behind a password). */
function Site() {
  const token = location.pathname.match(/^\/f\/([\w-]+)\/?$/)?.[1]
  return token ? <FriendSite token={token} /> : <OwnerSite />
}

function FriendSite({ token }: { token: string }) {
  const backend = useMemo(() => new FriendApi(token), [token])
  const list = useWishlist(backend, { refreshOnFocus: true })
  if (list.status === "error" && (list.error as { status?: number })?.status === 404) {
    return (
      <div className="text-muted-foreground grid min-h-dvh place-items-center p-6 text-center">
        <p className="max-w-sm">Ссылка устарела или в ней опечатка. Попроси у владельца списка новую.</p>
      </div>
    )
  }
  return <WishlistPage role="friend" backend={backend} list={list} />
}

function OwnerSite() {
  const backend = useMemo(() => new OwnerApi(), [])
  const list = useWishlist(backend)
  if (list.status === "login")
    return (
      <LoginScreen
        onLogin={async (password) => {
          await backend.login(password)
          await list.reload()
        }}
      />
    )
  return (
    <WishlistPage
      role="owner"
      backend={backend}
      list={list}
      onLogout={async () => {
        await backend.logout().catch(() => undefined)
        list.setStatus("login")
      }}
    />
  )
}

/** Clickable preview: in-memory data and a switch between the two versions. */
function Demo() {
  const [role, setRole] = useState<Role>(() => (location.hash === "#owner" ? "owner" : "friend"))
  const backend = useMemo(() => demoBackend(role), [role])
  const list = useWishlist(backend)

  const topBar = (
    <div className="border-b">
      <div className={`${gutter} flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5`}>
        <p className="text-muted-foreground text-xs">
          <b className="text-foreground">Макет</b> · данные примерные, фото пока заглушки
        </p>
        <Tabs
          value={role}
          onValueChange={(r) => {
            setRole(r as Role)
            history.replaceState(null, "", "#" + r)
          }}
        >
          <TabsList className="rounded-full">
            <TabsTrigger value="owner" className="rounded-full">
              Моя версия
            </TabsTrigger>
            <TabsTrigger value="friend" className="rounded-full">
              Для друзей
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )

  return <WishlistPage key={role} role={role} backend={backend} list={list} topBar={topBar} />
}
