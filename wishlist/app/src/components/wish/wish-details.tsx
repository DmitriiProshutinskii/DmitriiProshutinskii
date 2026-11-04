import { useState, type FormEvent } from "react"
import { ExternalLink, Layers, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { PeopleList } from "@/components/wish/people-list"
import { WishPhoto } from "@/components/wish/wish-photo"
import { PRIORITY_LABEL, domainOf, formatPrice, isTaken } from "@/lib/format"
import type { Role, Theme, Wish } from "@/lib/types"
import { cn } from "@/lib/utils"

interface Props {
  wish: Wish
  themes: Theme[]
  role: Role
  myName: string
  onOpenTheme: (id: string) => void
  onReserve: (name: string, note: string) => void
  onUnreserve: (index: number) => void
  onDelete: () => void
}

export function WishDetails({ wish, themes, role, myName, onOpenTheme, onReserve, onUnreserve, onDelete }: Props) {
  const hot = wish.priority === 3
  const domain = domainOf(wish.url)
  const wishThemes = wish.themeIds.map((id) => themes.find((t) => t.id === id)).filter((t): t is Theme => !!t)

  return (
    <div className="grid gap-4">
      <div
        className={cn(
          "bg-tile relative grid aspect-[4/3] place-items-center overflow-hidden rounded-3xl",
          hot && "bg-hot-soft ring-hot ring-2 ring-inset"
        )}
      >
        <WishPhoto wish={wish} className="size-[62%]" />
        {wish.multi && (
          <Badge variant="outline" className="absolute bottom-3 left-3 border-transparent shadow-sm">
            <Layers />
            Можно несколько
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant={hot ? "hot" : "secondary"}>{PRIORITY_LABEL[wish.priority]}</Badge>
        {wishThemes.map((t) => (
          <Badge key={t.id} asChild variant="theme" className={cn(`th-${t.color}`, "cursor-pointer")}>
            <button type="button" onClick={() => onOpenTheme(t.id)}>
              {t.name}
            </button>
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="font-display text-2xl font-medium tabular-nums">{formatPrice(wish.price)}</span>
        {wish.url && (
          <Button variant="link" asChild className="h-auto p-0 font-bold">
            <a href={wish.url} target="_blank" rel="noopener noreferrer">
              Открыть на {domain}
              <ExternalLink />
            </a>
          </Button>
        )}
      </div>

      {wish.note && (
        <div className="bg-muted rounded-2xl p-3.5 text-sm">
          <div className="text-muted-foreground mb-0.5 text-[11px] font-bold tracking-wider uppercase">Комментарий Димы</div>
          {wish.note}
        </div>
      )}

      {role === "friend" ? (
        <ReserveCard wish={wish} myName={myName} onReserve={onReserve} onUnreserve={onUnreserve} />
      ) : (
        <>
          <Separator />
          <p className="text-muted-foreground text-sm">Брони друзей здесь не показываются, сюрприз останется сюрпризом.</p>
          <Button variant="ghost" className="text-destructive hover:text-destructive justify-self-start" onClick={onDelete}>
            <Trash2 />
            Удалить желание
          </Button>
        </>
      )}
    </div>
  )
}

function ReserveCard({
  wish,
  myName,
  onReserve,
  onUnreserve,
}: {
  wish: Wish
  myName: string
  onReserve: (name: string, note: string) => void
  onUnreserve: (index: number) => void
}) {
  const [name, setName] = useState(myName)
  const [note, setNote] = useState("")
  const taken = isTaken(wish)
  const alreadyMine = wish.reservations.some((r) => r.mine)
  const people = wish.reservations.map((r) => ({ by: r.by, text: r.note, mine: r.mine }))
  const count = wish.reservations.length

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onReserve(name.trim(), note.trim())
    setNote("")
  }

  let title = ""
  if (taken) title = "Уже забронировано"
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
          <form onSubmit={submit} className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="r-name">Твоё имя</Label>
              <Input id="r-name" required maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, Катя" />
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
            <Button type="submit" size="lg" className="w-full rounded-xl">
              {wish.multi && count ? "Я тоже подарю" : "Забронировать"}
            </Button>
            <p className="text-muted-foreground text-center text-xs">Дима не увидит, кто и что забронировал.</p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
