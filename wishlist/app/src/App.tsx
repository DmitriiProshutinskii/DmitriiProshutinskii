import { useMemo, useState } from "react"
import { Share } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { NewThemeForm } from "@/components/wish/new-theme-form"
import { NewWishForm } from "@/components/wish/new-wish-form"
import { ResponsiveSheet } from "@/components/wish/responsive-sheet"
import { ThemeCard, AddThemeCard } from "@/components/wish/theme-card"
import { ThemeDetails } from "@/components/wish/theme-details"
import { WishDetails } from "@/components/wish/wish-details"
import { AddWishTile, WishTile } from "@/components/wish/wish-tile"
import { byPriority, isTaken } from "@/lib/format"
import { seedParams, seedThemes, seedWishes } from "@/lib/seed"
import type { Role, Theme, Wish } from "@/lib/types"

type Sheet = { type: "wish"; id: string } | { type: "theme"; id: string } | { type: "new-wish" } | { type: "new-theme" }

const gutter = "mx-auto max-w-5xl pl-[max(16px,env(safe-area-inset-left,0px))] pr-[max(16px,env(safe-area-inset-right,0px))]"
const FRIEND_LINK = "https://wish.example/f/k7q2x9"

const initialRole = (): Role => (location.hash === "#owner" ? "owner" : "friend")
let nextId = 100

export default function App() {
  const [role, setRole] = useState<Role>(initialRole)
  const [wishes, setWishes] = useState<Wish[]>(seedWishes)
  const [themes, setThemes] = useState<Theme[]>(seedThemes)
  const [filter, setFilter] = useState("all")
  const [sheet, setSheet] = useState<Sheet | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [myName, setMyName] = useState("")

  const friend = role === "friend"
  const open = (s: Sheet) => {
    setSheet(s)
    setSheetOpen(true)
  }
  const close = () => setSheetOpen(false)

  const switchRole = (r: string) => {
    setRole(r as Role)
    setFilter("all")
    close()
    history.replaceState(null, "", "#" + r)
  }

  const visible = useMemo(() => {
    let list = wishes
    if (filter === "hot") list = list.filter((w) => w.priority === 3)
    else if (filter === "multi") list = list.filter((w) => w.multi)
    else if (filter.startsWith("th:")) list = list.filter((w) => w.themeIds.includes(filter.slice(3)))
    return [...list].sort(byPriority)
  }, [wishes, filter])

  const free = wishes.filter((w) => !isTaken(w)).length
  const filters = [
    { value: "all", label: "Все", count: wishes.length },
    { value: "hot", label: "Очень хочу", count: wishes.filter((w) => w.priority === 3).length, dot: true },
    { value: "multi", label: "Можно несколько", count: wishes.filter((w) => w.multi).length },
    ...themes.map((t) => ({ value: "th:" + t.id, label: t.name, count: wishes.filter((w) => w.themeIds.includes(t.id)).length })),
  ]

  const updateWish = (id: string, fn: (w: Wish) => Wish) => setWishes((ws) => ws.map((w) => (w.id === id ? fn(w) : w)))
  const updateTheme = (id: string, fn: (t: Theme) => Theme) => setThemes((ts) => ts.map((t) => (t.id === id ? fn(t) : t)))

  const share = () => {
    const ok = () => toast("Ссылка для друзей скопирована")
    const fail = () => toast(`Ссылка для друзей: ${FRIEND_LINK}`)
    try {
      navigator.clipboard.writeText(FRIEND_LINK).then(ok, fail)
    } catch {
      fail()
    }
  }

  // ----- sheet content -----
  let sheetEyebrow = ""
  let sheetTitle = ""
  let sheetBody: React.ReactNode = null
  if (sheet?.type === "wish") {
    const wish = wishes.find((w) => w.id === sheet.id)
    if (wish) {
      sheetEyebrow = friend ? "Желание" : "Твоё желание"
      sheetTitle = wish.title
      sheetBody = (
        <WishDetails
          key={wish.id + role}
          wish={wish}
          themes={themes}
          role={role}
          myName={myName}
          onOpenTheme={(id) => open({ type: "theme", id })}
          onReserve={(name, note) => {
            setMyName(name)
            updateWish(wish.id, (w) => ({ ...w, reservations: [...w.reservations, { by: name, note, mine: true }] }))
            toast(wish.multi ? "Записали тебя. Дима не узнает" : "Забронировано. Дима не узнает")
          }}
          onUnreserve={(i) => {
            updateWish(wish.id, (w) => ({ ...w, reservations: w.reservations.filter((_, j) => j !== i) }))
            toast("Бронь снята")
          }}
          onDelete={() => {
            setWishes((ws) => ws.filter((w) => w.id !== wish.id))
            close()
            toast("Желание удалено")
          }}
        />
      )
    }
  } else if (sheet?.type === "theme") {
    const theme = themes.find((t) => t.id === sheet.id)
    if (theme) {
      sheetEyebrow = "Тематика"
      sheetTitle = theme.name
      sheetBody = (
        <ThemeDetails
          key={theme.id + role}
          theme={theme}
          wishes={wishes}
          role={role}
          myName={myName}
          onOpenWish={(id) => open({ type: "wish", id })}
          onPledge={(name, text) => {
            setMyName(name)
            updateTheme(theme.id, (t) => ({ ...t, pledges: [...t.pledges, { by: name, text, mine: true }] }))
            toast("Отметили. Друзья увидят, Дима нет")
          }}
          onUnpledge={(i) => {
            updateTheme(theme.id, (t) => ({ ...t, pledges: t.pledges.filter((_, j) => j !== i) }))
            toast("Отметка убрана")
          }}
          onDelete={() => {
            setThemes((ts) => ts.filter((t) => t.id !== theme.id))
            setWishes((ws) => ws.map((w) => ({ ...w, themeIds: w.themeIds.filter((x) => x !== theme.id) })))
            if (filter === "th:" + theme.id) setFilter("all")
            close()
            toast("Тематика удалена")
          }}
        />
      )
    }
  } else if (sheet?.type === "new-wish") {
    sheetEyebrow = "Твой список"
    sheetTitle = "Новое желание"
    sheetBody = (
      <NewWishForm
        themes={themes}
        onSubmit={(data) => {
          setWishes((ws) => [...ws, { ...data, id: "w" + nextId++, reservations: [] }])
          setFilter("all")
          close()
          toast("Желание добавлено")
        }}
      />
    )
  } else if (sheet?.type === "new-theme") {
    sheetEyebrow = "Твой список"
    sheetTitle = "Новая тематика"
    sheetBody = (
      <NewThemeForm
        onSubmit={(data) => {
          setThemes((ts) => [...ts, { ...data, id: "t" + nextId++, pledges: [] }])
          close()
          toast("Тематика создана")
        }}
      />
    )
  }

  return (
    <div className="min-h-dvh">
      <div className="border-b">
        <div className={`${gutter} flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5`}>
          <p className="text-muted-foreground text-xs">
            <b className="text-foreground">Макет на shadcn/ui</b> · фото пока заглушки, всё кликается
          </p>
          <Tabs value={role} onValueChange={switchRole}>
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

      <main className={`${gutter} grid gap-9 pt-7 pb-16 [&>*]:min-w-0`}>
        <header className="grid gap-3">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-[clamp(2rem,6vw,2.9rem)] leading-[1.02] font-bold tracking-tight text-balance">Вишлист Димы</h1>
            {!friend && (
              <Button variant="outline" size="icon" className="size-11 shrink-0 rounded-full" onClick={share} aria-label="Скопировать ссылку для друзей">
                <Share className="size-5" />
              </Button>
            )}
          </div>
          <p className="text-muted-foreground max-w-[60ch]">
            {friend
              ? `Выбирай и бронируй, чтобы подарки не повторились. Дима не узнает, кто что выбрал. Свободно ${free} из ${wishes.length}.`
              : "Твоя версия. Брони друзей скрыты, сюрприз не испортится. Добавляй желания и тематики."}
          </p>
          <ul className="flex flex-wrap gap-2">
            {seedParams.map((p) => (
              <li key={p.label}>
                <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-[13px] font-semibold">
                  <span className="text-muted-foreground font-medium">{p.label}</span>
                  {p.value}
                </Badge>
              </li>
            ))}
          </ul>
        </header>

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

        <section className="grid gap-4">
          <h2 className="font-display text-lg font-medium tracking-tight">Желания</h2>
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
          <div className="grid grid-cols-[repeat(auto-fill,minmax(158px,1fr))] gap-x-3.5 gap-y-6">
            {!friend && <AddWishTile onClick={() => open({ type: "new-wish" })} />}
            {visible.map((w) => (
              <WishTile key={w.id} wish={w} role={role} onOpen={() => open({ type: "wish", id: w.id })} />
            ))}
            {friend && visible.length === 0 && <p className="text-muted-foreground col-span-full py-6">Здесь пока пусто.</p>}
          </div>
        </section>

        <section className="text-muted-foreground grid gap-2 border-t pt-6 text-sm">
          <h2 className="text-foreground font-bold">Как это устроено</h2>
          <ul className="grid max-w-[74ch] list-disc gap-1.5 pl-5">
            <li>
              <b className="text-foreground">Две ссылки.</b> По твоей (с паролем) можно добавлять и удалять желания. По ссылке для друзей можно смотреть и бронировать. Брони
              и отметки по тематикам до твоей версии вообще не доходят.
            </li>
            <li>
              <b className="text-foreground">Фото</b> на настоящем сайте подтянется по ссылке на товар. Можно загрузить и своё.
            </li>
            <li>
              <b className="text-foreground">«Можно несколько»</b> бронирует сколько угодно друзей. Остальное бронирует один человек.
            </li>
          </ul>
        </section>
      </main>

      <ResponsiveSheet open={sheetOpen && !!sheetBody} onOpenChange={setSheetOpen} eyebrow={sheetEyebrow} title={sheetTitle}>
        {sheetBody}
      </ResponsiveSheet>
      <Toaster />
    </div>
  )
}
