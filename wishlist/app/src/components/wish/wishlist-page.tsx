import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Loader2, Settings2, Share } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { NewThemeForm } from "@/components/wish/new-theme-form"
import { ResponsiveSheet } from "@/components/wish/responsive-sheet"
import { SettingsForm, copyText } from "@/components/wish/settings-form"
import { AddThemeCard, ThemeCard } from "@/components/wish/theme-card"
import { ThemeDetails } from "@/components/wish/theme-details"
import { WishDetails } from "@/components/wish/wish-details"
import { WishForm } from "@/components/wish/wish-form"
import { AddWishTile, WishTile } from "@/components/wish/wish-tile"
import type { useWishlist } from "@/hooks/use-wishlist"
import { storage, type Backend } from "@/lib/backend"
import { byPriority, isTaken } from "@/lib/format"
import type { Role } from "@/lib/types"

type Sheet =
  | { type: "wish"; id: string }
  | { type: "edit-wish"; id: string }
  | { type: "theme"; id: string }
  | { type: "new-wish" }
  | { type: "new-theme" }
  | { type: "settings" }

export const gutter = "mx-auto w-full max-w-5xl pl-[max(16px,env(safe-area-inset-left,0px))] pr-[max(16px,env(safe-area-inset-right,0px))]"

interface Props {
  role: Role
  backend: Backend
  list: ReturnType<typeof useWishlist>
  topBar?: ReactNode
  footer?: ReactNode
  onLogout?: () => void
}

export function WishlistPage({ role, backend, list, topBar, footer, onLogout }: Props) {
  const { view, status, run } = list
  const [filter, setFilter] = useState("all")
  const [sheet, setSheet] = useState<Sheet | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [myName, setMyNameState] = useState(() => storage.get("wl_name") ?? "")
  const friend = role === "friend"

  const setMyName = (n: string) => {
    setMyNameState(n)
    storage.set("wl_name", n)
  }
  const open = (s: Sheet) => {
    setSheet(s)
    setSheetOpen(true)
  }
  const close = () => setSheetOpen(false)

  useEffect(() => {
    if (view?.title) document.title = view.title
  }, [view?.title])

  const wishes = useMemo(() => view?.wishes ?? [], [view])
  const themes = view?.themes ?? []
  const visible = useMemo(() => {
    let l = wishes
    if (filter === "hot") l = l.filter((w) => w.priority === 3)
    else if (filter === "multi") l = l.filter((w) => w.multi)
    else if (filter.startsWith("th:")) l = l.filter((w) => w.themeIds.includes(filter.slice(3)))
    return [...l].sort(byPriority)
  }, [wishes, filter])

  if (status === "loading" || !view) {
    return (
      <div className="min-h-dvh">
        {topBar}
        <div className="text-muted-foreground grid min-h-[60dvh] place-items-center">
          {status === "error" ? (
            <div className="grid justify-items-center gap-3 text-center">
              <p>Не получилось загрузить список.</p>
              <Button variant="outline" onClick={list.reload}>
                Попробовать ещё раз
              </Button>
            </div>
          ) : (
            <Loader2 className="size-6 animate-spin" aria-label="Загрузка" />
          )}
        </div>
      </div>
    )
  }

  const friendLink = view.friendPath ? location.origin + view.friendPath : ""
  const owner = view.ownerName
  const free = wishes.filter((w) => !isTaken(w)).length
  const filters: { value: string; label: string; count: number; dot?: boolean }[] = [
    { value: "all", label: "Все", count: wishes.length },
    { value: "hot", label: "Очень хочу", count: wishes.filter((w) => w.priority === 3).length, dot: true },
    { value: "multi", label: "Можно несколько", count: wishes.filter((w) => w.multi).length },
    ...themes.map((t) => ({ value: "th:" + t.id, label: t.name, count: wishes.filter((w) => w.themeIds.includes(t.id)).length })),
  ].filter((f) => f.value === "all" || f.count > 0)

  // ----- sheet content -----
  let eyebrow = ""
  let title = ""
  let body: ReactNode = null
  if (sheet?.type === "wish") {
    const wish = wishes.find((w) => w.id === sheet.id)
    if (wish) {
      eyebrow = friend ? "Желание" : "Твоё желание"
      title = wish.title
      body = (
        <WishDetails
          wish={wish}
          themes={themes}
          role={role}
          ownerName={owner}
          myName={myName}
          onOpenTheme={(id) => open({ type: "theme", id })}
          onReserve={(name, note) => {
            setMyName(name)
            return run((b) => b.reserve(wish.id, name, note), wish.multi ? "Записали. Это останется сюрпризом" : "Забронировано. Это останется сюрпризом")
          }}
          onUnreserve={(rid) => run((b) => b.unreserve(wish.id, rid), "Бронь снята")}
          onEdit={() => open({ type: "edit-wish", id: wish.id })}
          onDelete={async () => {
            if (await run((b) => b.deleteWish(wish.id), "Желание удалено")) close()
          }}
        />
      )
    }
  } else if (sheet?.type === "edit-wish") {
    const wish = wishes.find((w) => w.id === sheet.id)
    if (wish) {
      eyebrow = "Изменить желание"
      title = wish.title
      body = (
        <WishForm
          key={wish.id}
          initial={wish}
          themes={themes}
          submitLabel="Сохранить"
          onUpload={backend.uploadPhoto}
          onPreview={backend.preview}
          onSubmit={async (input) => {
            const ok = await run((b) => b.updateWish(wish.id, input), "Сохранено")
            if (ok) open({ type: "wish", id: wish.id })
            return ok
          }}
        />
      )
    }
  } else if (sheet?.type === "theme") {
    const theme = themes.find((t) => t.id === sheet.id)
    if (theme) {
      eyebrow = "Тематика"
      title = theme.name
      body = (
        <ThemeDetails
          key={theme.id}
          theme={theme}
          wishes={wishes}
          role={role}
          ownerName={owner}
          myName={myName}
          onOpenWish={(id) => open({ type: "wish", id })}
          onPledge={(name, text) => {
            setMyName(name)
            return run((b) => b.pledge(theme.id, name, text), "Отметили. Друзья увидят")
          }}
          onUnpledge={(pid) => run((b) => b.unpledge(theme.id, pid), "Отметка убрана")}
          onDelete={async () => {
            if (filter === "th:" + theme.id) setFilter("all")
            if (await run((b) => b.deleteTheme(theme.id), "Тематика удалена")) close()
          }}
        />
      )
    }
  } else if (sheet?.type === "new-wish") {
    eyebrow = "Твой список"
    title = "Новое желание"
    body = (
      <WishForm
        themes={themes}
        submitLabel="Добавить"
        onUpload={backend.uploadPhoto}
        onPreview={backend.preview}
        onSubmit={async (input) => {
          const ok = await run((b) => b.addWish(input), "Желание добавлено")
          if (ok) {
            setFilter("all")
            close()
          }
          return ok
        }}
      />
    )
  } else if (sheet?.type === "new-theme") {
    eyebrow = "Твой список"
    title = "Новая тематика"
    body = (
      <NewThemeForm
        onSubmit={async (input) => {
          if (await run((b) => b.addTheme(input), "Тематика создана")) close()
        }}
      />
    )
  } else if (sheet?.type === "settings") {
    eyebrow = "Настройки"
    title = "Список и ссылка для друзей"
    body = (
      <SettingsForm
        settings={{ title: view.title, ownerName: view.ownerName, params: view.params }}
        friendLink={friendLink}
        onSave={async (s) => {
          const ok = await run((b) => b.saveSettings(s), "Сохранено")
          if (ok) close()
          return ok
        }}
        onRotateLink={() => run((b) => b.rotateFriendLink(), "Ссылка обновлена. Отправь друзьям новую")}
        onLogout={onLogout}
      />
    )
  }

  return (
    <div className="min-h-dvh">
      {topBar}

      <main className={`${gutter} grid gap-9 pt-7 pb-16 [&>*]:min-w-0`}>
        <header className="grid gap-3">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-[clamp(2rem,6vw,2.9rem)] leading-[1.02] font-bold tracking-tight text-balance">{view.title}</h1>
            {!friend && (
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="icon" className="size-11 rounded-full" onClick={() => copyText(friendLink, "Ссылка для друзей скопирована")} aria-label="Скопировать ссылку для друзей">
                  <Share className="size-5" />
                </Button>
                <Button variant="outline" size="icon" className="size-11 rounded-full" onClick={() => open({ type: "settings" })} aria-label="Настройки">
                  <Settings2 className="size-5" />
                </Button>
              </div>
            )}
          </div>
          <p className="text-muted-foreground max-w-[60ch]">
            {friend
              ? `Выбирай и бронируй, чтобы подарки не повторились. ${owner || "Владелец списка"} не узнает, кто что выбрал.${wishes.length ? ` Свободно ${free} из ${wishes.length}.` : ""}`
              : "Твоя версия. Брони друзей скрыты, сюрприз не испортится."}
          </p>
          {(view.params.length > 0 || !friend) && (
            <ul className="flex flex-wrap gap-2">
              {view.params.map((p, i) => (
                <li key={i}>
                  <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-[13px] font-semibold whitespace-normal">
                    <span className="text-muted-foreground font-medium">{p.label}</span>
                    {p.value}
                  </Badge>
                </li>
              ))}
              {!friend && (
                <li>
                  <Badge asChild variant="outline" className="text-muted-foreground cursor-pointer border-dashed px-3 py-1.5 text-[13px] font-semibold">
                    <button type="button" onClick={() => open({ type: "settings" })}>
                      {view.params.length ? "Изменить параметры" : "+ Размеры, цвета, что не дарить"}
                    </button>
                  </Badge>
                </li>
              )}
            </ul>
          )}
        </header>

        {(themes.length > 0 || !friend) && (
          <section className="grid gap-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-lg font-medium tracking-tight">Тематики</h2>
              <p className="text-muted-foreground text-sm">Подойдёт что угодно по теме</p>
            </div>
            <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1.5">
              {themes.map((t) => (
                <ThemeCard
                  key={t.id}
                  theme={t}
                  role={role}
                  ideas={wishes.filter((w) => w.themeIds.includes(t.id)).length}
                  onOpen={() => open({ type: "theme", id: t.id })}
                />
              ))}
              {!friend && <AddThemeCard onClick={() => open({ type: "new-theme" })} />}
            </div>
          </section>
        )}

        <section className="grid gap-4">
          <h2 className="font-display text-lg font-medium tracking-tight">Желания</h2>
          {filters.length > 1 && (
            <div className="-mx-1 overflow-x-auto px-1 pb-1">
              <ToggleGroup type="single" value={filter} onValueChange={(v) => v && setFilter(v)} variant="outline" aria-label="Фильтр">
                {filters.map((f) => (
                  <ToggleGroupItem
                    key={f.value}
                    value={f.value}
                    className="bg-card text-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary rounded-full px-3.5"
                  >
                    {f.dot && <span className="bg-hot size-2 rounded-full" />}
                    {f.label}
                    <span className="text-xs opacity-60">{f.count}</span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(158px,1fr))] gap-x-3.5 gap-y-6">
            {!friend && <AddWishTile onClick={() => open({ type: "new-wish" })} />}
            {visible.map((w) => (
              <WishTile key={w.id} wish={w} role={role} onOpen={() => open({ type: "wish", id: w.id })} />
            ))}
            {friend && visible.length === 0 && <p className="text-muted-foreground col-span-full py-6">Список пока пуст. Загляни позже.</p>}
          </div>
        </section>

        {footer}
      </main>

      <ResponsiveSheet open={sheetOpen && !!body} onOpenChange={setSheetOpen} eyebrow={eyebrow} title={title}>
        {body}
      </ResponsiveSheet>
    </div>
  )
}
