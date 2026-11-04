import { useState, type FormEvent } from "react"
import { ExternalLink, Layers, Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmButton } from "@/components/wish/confirm-button"
import { PeopleList } from "@/components/wish/people-list"
import { WishPhoto } from "@/components/wish/wish-photo"
import { PRIORITY_LABEL, domainOf, formatPrice, isTaken } from "@/lib/format"
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
}

export function WishDetails({ wish, themes, role, ownerName, myName, onOpenTheme, onReserve, onUnreserve, onEdit, onDelete }: Props) {
  const hot = wish.priority === 3
  const domain = domainOf(wish.url)
  const wishThemes = wish.themeIds.map((id) => themes.find((t) => t.id === id)).filter((t): t is Theme => !!t)

  return (
    <div className="grid gap-4">
      <div
        className={cn(
          // Kept short so the reserve form is on screen when the sheet opens on a phone.
          "bg-tile relative mx-auto grid aspect-[16/10] max-h-[32dvh] w-full place-items-center overflow-hidden rounded-3xl",
          hot && "bg-hot-soft ring-hot ring-2 ring-inset"
        )}
      >
        <WishPhoto wish={wish} className="size-[70%]" />
        {wish.multi && (
          <Badge variant="outline" className="absolute bottom-3 left-3 border-transparent shadow-sm">
            <Layers />
            Можно несколько
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant={hot ? "hot" : "secondary"} className="h-10 px-3.5 text-[13px]">
          {PRIORITY_LABEL[wish.priority]}
        </Badge>
        {wishThemes.map((t) => (
          <Badge key={t.id} asChild variant="theme" className={cn(`th-${t.color}`, "h-10 cursor-pointer px-3.5 text-[13px]")}>
            <button type="button" onClick={() => onOpenTheme(t.id)}>
              {t.name}
            </button>
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="font-display text-2xl font-medium tabular-nums">{formatPrice(wish.price)}</span>
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
        <div className="bg-muted rounded-3xl p-4 text-sm break-words">
          <div className="text-muted-foreground mb-0.5 text-[11px] font-bold tracking-wider uppercase">
            {role === "friend" ? `Комментарий${ownerName ? ` от ${ownerName}` : ""}` : "Твой комментарий"}
          </div>
          {wish.note}
        </div>
      )}

      {role === "friend" ? (
        <ReserveCard key={wish.id} wish={wish} ownerName={ownerName} myName={myName} onReserve={onReserve} onUnreserve={onUnreserve} />
      ) : (
        <>
          <Separator />
          <p className="text-muted-foreground text-sm">Брони друзей здесь не показываются, сюрприз останется сюрпризом.</p>
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
    <Card className="gap-4 rounded-3xl py-4 shadow-none">
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
