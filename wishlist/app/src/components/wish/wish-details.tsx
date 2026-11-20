import { useState, type FormEvent } from "react"
import { CircleCheck, ExternalLink, Layers, Pencil, Trash2, Undo2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmButton } from "@/components/wish/confirm-button"
import { PeopleList } from "@/components/wish/people-list"
import { LinkifiedText } from "@/components/wish/linkified-text"
import { WishPhoto } from "@/components/wish/wish-photo"
import { DONE_PRESETS, PRIORITY_LABEL, domainOf, formatPrice, isDone, isTaken } from "@/lib/format"
import type { Role, Theme, Wish } from "@/lib/types"
import { cn } from "@/lib/utils"
import { SheetFooter } from "@/components/wish/responsive-sheet"

interface Props {
  wish: Wish
  themes: Theme[]
  role: Role
  ownerName: string
  myName: string
  onOpenTheme: (id: string) => void
  onReserve: (name: string, note: string) => Promise<boolean>
  onUnreserve: (reservationId: string) => void
  onEdit: () => void
  onDelete: () => void
  onSetDone: (done: string | null) => Promise<boolean>
}

export function WishDetails({ wish, themes, role, ownerName, myName, onOpenTheme, onReserve, onUnreserve, onEdit, onDelete, onSetDone }: Props) {
  const done = isDone(wish)
  const hot = wish.priority === 3 && !done
  const domain = domainOf(wish.url)
  const wishThemes = wish.themeIds.map((id) => themes.find((t) => t.id === id)).filter((t): t is Theme => !!t)

  return (
    <div className="grid gap-4">
      <div
        className={cn(
          // Kept short so the reserve form is on screen when the sheet opens on a phone.
          "bg-tile relative mx-auto grid aspect-square h-[min(30dvh,320px)] place-items-center overflow-hidden rounded-2xl after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:content-['']",
          hot && "bg-hot-soft after:ring-2 after:ring-inset after:ring-hot",
          wish.photo && "bg-white"
        )}
      >
        <WishPhoto wish={wish} className={cn(!wish.photo && "size-[70%]", done && "opacity-50 grayscale")} />
        {wish.multi && !done && (
          <Badge variant="outline" className="absolute bottom-3 left-3 border-transparent shadow-sm">
            <Layers />
            Можно несколько
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {done ? (
          <Badge variant="secondary" className="h-10 px-3.5 text-[13px]">
            <CircleCheck />
            {wish.done} · уже не нужно
          </Badge>
        ) : (
          <Badge variant={hot ? "hot" : "secondary"} className="h-10 px-3.5 text-[13px]">
            {PRIORITY_LABEL[wish.priority]}
          </Badge>
        )}
        {wishThemes.map((t) => (
          <Badge key={t.id} asChild variant="theme" className={cn(`th-${t.color}`, "h-10 cursor-pointer px-3.5 text-[13px]")}>
            <button type="button" onClick={() => onOpenTheme(t.id)}>
              {t.name}
            </button>
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        {wish.price === null ? (
          <span className="text-muted-foreground font-medium">Цена не указана</span>
        ) : (
          <span className={cn("text-2xl font-bold tracking-tight tabular-nums", done && "text-muted-foreground")}>{formatPrice(wish.price, wish.currency)}</span>
        )}
        {wish.url && (
          <Button variant="outline" asChild>
            <a href={wish.url} target="_blank" rel="noopener noreferrer">
              Открыть на {domain}
              <ExternalLink />
            </a>
          </Button>
        )}
      </div>

      {wish.note && (
        <div className="bg-muted rounded-2xl p-4 text-sm break-words">
          <div className="text-muted-foreground mb-0.5 text-[11px] font-bold tracking-wider uppercase">
            {role === "friend" ? (ownerName ? `${ownerName} пишет` : "Комментарий") : "Твой комментарий"}
          </div>
          <LinkifiedText text={wish.note} />
        </div>
      )}

      {role === "friend" && done ? (
        <DoneCard key={wish.id} wish={wish} ownerName={ownerName} onUnreserve={onUnreserve} />
      ) : role === "friend" ? (
        <ReserveCard key={wish.id} wish={wish} ownerName={ownerName} myName={myName} onReserve={onReserve} onUnreserve={onUnreserve} />
      ) : (
        <>
          <Separator />
          <p className="text-muted-foreground text-sm">Брони друзей здесь не показываются, сюрприз останется сюрпризом.</p>
          <DoneControl key={wish.id} wish={wish} onSetDone={onSetDone} />
          <div className="grid gap-2">
            <Button variant="outline" className="justify-self-start" onClick={onEdit}>
              <Pencil />
              Изменить
            </Button>
            <ConfirmButton question="Удалить это желание?" confirmLabel="Удалить" onConfirm={onDelete}>
              <Trash2 />
              Удалить желание
            </ConfirmButton>
          </div>
        </>
      )}
    </div>
  )
}

/** Friend view of a wish the owner no longer needs. A reservation made before that can still be cancelled. */
function DoneCard({ wish, ownerName, onUnreserve }: { wish: Wish; ownerName: string; onUnreserve: (id: string) => void }) {
  const mine = wish.reservations.filter((r) => r.mine).map((r) => ({ id: r.id, by: r.by, text: r.note, mine: true }))
  return (
    <Card className="gap-3 rounded-2xl py-4 shadow-none">
      <CardHeader className="px-4">
        <CardTitle>Дарить не нужно</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 px-4 text-sm">
        <p>
          {ownerName || "Владелец списка"} пишет: «{wish.done}». Желание осталось в списке, чтобы было видно, что его уже не дарят.
        </p>
        {mine.length > 0 && (
          <>
            <p className="text-muted-foreground">Твоя бронь ещё стоит. Её можно снять и выбрать другой подарок.</p>
            <PeopleList people={mine} onRemove={onUnreserve} removeLabel="Снять бронь" />
          </>
        )}
      </CardContent>
    </Card>
  )
}

/** Owner: mark a wish as no longer needed («Купил», «Починил»…) or put it back on the list. */
function DoneControl({ wish, onSetDone }: { wish: Wish; onSetDone: (done: string | null) => Promise<boolean> }) {
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState("")
  const [busy, setBusy] = useState(false)

  const set = async (value: string | null) => {
    if (busy) return
    setBusy(true)
    if (await onSetDone(value)) {
      setOpen(false)
      setCustom("")
    }
    setBusy(false)
  }

  if (isDone(wish))
    return (
      <div className="bg-muted grid gap-3 rounded-2xl p-4 text-sm">
        <p>
          Помечено как «{wish.done}». Друзья видят это желание серым и не могут его забронировать.
        </p>
        <Button variant="outline" className="justify-self-start" disabled={busy} onClick={() => set(null)}>
          <Undo2 />
          Вернуть в список
        </Button>
      </div>
    )

  if (!open)
    return (
      <Button variant="outline" className="justify-self-start" onClick={() => setOpen(true)}>
        <CircleCheck />
        Уже не нужно
      </Button>
    )

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (custom.trim()) set(custom.trim())
  }

  return (
    <div className="bg-muted grid gap-3 rounded-2xl p-4">
      <p className="text-sm font-semibold">Почему уже не нужно?</p>
      <div className="flex flex-wrap gap-2">
        {DONE_PRESETS.map((label) => (
          <Button key={label} variant="outline" className="bg-card" disabled={busy} onClick={() => set(label)}>
            {label}
          </Button>
        ))}
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <Input aria-label="Своя причина" maxLength={40} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Своя причина" className="bg-card" />
        <Button type="submit" disabled={busy || !custom.trim()}>
          Отметить
        </Button>
      </form>
      <Button variant="ghost" className="justify-self-start" onClick={() => setOpen(false)}>
        Отмена
      </Button>
    </div>
  )
}

function ReserveCard({
  wish,
  ownerName,
  myName,
  onReserve,
  onUnreserve,
}: {
  wish: Wish
  ownerName: string
  myName: string
  onReserve: (name: string, note: string) => Promise<boolean>
  onUnreserve: (id: string) => void
}) {
  const [name, setName] = useState(myName)
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)
  const taken = isTaken(wish)
  const alreadyMine = wish.reservations.some((r) => r.mine)
  const people = wish.reservations.map((r) => ({ id: r.id, by: r.by, text: r.note, mine: r.mine }))
  const count = wish.reservations.length

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || busy) return
    setBusy(true)
    if (await onReserve(name.trim(), note.trim())) setNote("")
    setBusy(false)
  }

  let title = ""
  if (alreadyMine && !wish.multi) title = "Ты даришь это"
  else if (taken) title = "Уже забронировано"
  else if (wish.multi) title = count ? `Уже дарят: ${count}` : "Можно подарить нескольким"

  return (
    <Card className="gap-4 rounded-2xl py-4 shadow-none">
      {title && (
        <CardHeader className="px-4">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="grid gap-4 px-4">
        <PeopleList people={people} onRemove={onUnreserve} removeLabel="Снять бронь" />
        {!taken && !alreadyMine && (
          <form id="reserve-form" onSubmit={submit} className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="r-name">Твоё имя</Label>
              <Input id="r-name" required maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, Катя" autoComplete="given-name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="r-note">Комментарий для других друзей</Label>
              <Textarea
                id="r-note"
                maxLength={300}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={wish.multi ? "Что именно подаришь" : "Беру сам / давайте скинемся"}
              />
            </div>
            {/* Pinned to the bottom of the sheet while the form scrolls, so the main action is always in reach. */}
            <SheetFooter>
              <Button type="submit" form="reserve-form" size="lg" className="w-full" disabled={busy}>
                {wish.multi && count ? "Я тоже подарю" : "Забронировать"}
              </Button>
            </SheetFooter>
            <p className="text-muted-foreground text-xs">{ownerName || "Владелец списка"} не увидит, кто и что забронировал.</p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
