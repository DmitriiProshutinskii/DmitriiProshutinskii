import { useState, type FormEvent } from "react"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ConfirmButton } from "@/components/wish/confirm-button"
import { PeopleList } from "@/components/wish/people-list"
import { WishPhoto } from "@/components/wish/wish-photo"
import { PRIORITY_LABEL, byPriority, formatPrice, isTaken } from "@/lib/format"
import type { Role, Theme, Wish } from "@/lib/types"
import { cn } from "@/lib/utils"
import { SheetFooter } from "@/components/wish/responsive-sheet"

interface Props {
  theme: Theme
  wishes: Wish[]
  role: Role
  ownerName: string
  myName: string
  onOpenWish: (id: string) => void
  onPledge: (name: string, text: string) => Promise<boolean>
  onUnpledge: (pledgeId: string) => void
  onDelete: () => void
}

export function ThemeDetails({ theme, wishes, role, ownerName, myName, onOpenWish, onPledge, onUnpledge, onDelete }: Props) {
  const [name, setName] = useState(myName)
  const [text, setText] = useState("")
  const [busy, setBusy] = useState(false)
  const ideas = wishes.filter((w) => w.themeIds.includes(theme.id)).sort(byPriority)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !text.trim() || busy) return
    setBusy(true)
    if (await onPledge(name.trim(), text.trim())) setText("")
    setBusy(false)
  }

  return (
    <div className={cn("grid gap-4", `th-${theme.color}`)}>
      <div className={cn("bg-th-soft relative overflow-hidden rounded-3xl p-5", theme.flag && "flag-corner")}>
        {theme.description && <p className="max-w-[46ch] pr-8 break-words">{theme.description}</p>}
        <p className="text-th mt-2 text-sm font-bold">Подойдёт что угодно по теме, не только идеи из списка.</p>
      </div>

      {ideas.length > 0 && (
        <Card className="gap-3 rounded-3xl py-4 shadow-none">
          <CardHeader className="px-4">
            <CardTitle>Идеи из списка</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <ul className="grid">
              {ideas.map((w) => (
                <li key={w.id}>
                  <button
                    type="button"
                    onClick={() => onOpenWish(w.id)}
                    className="hover:bg-muted grid w-full grid-cols-[56px_1fr_auto] items-center gap-3 rounded-lg p-2 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <span className={cn("bg-tile grid aspect-square place-items-center overflow-hidden rounded-lg", w.priority === 3 && "bg-hot-soft ring-hot ring-2 ring-inset")}>
                      <WishPhoto wish={w} className="size-[80%]" />
                    </span>
                    <span className="min-w-0 text-sm leading-tight font-semibold">
                      {w.title}
                      <span className="text-muted-foreground block text-xs font-semibold">
                        {PRIORITY_LABEL[w.priority].toLowerCase()}
                        {role === "friend" && isTaken(w) && " · забронировано"}
                        {w.multi && " · можно несколько"}
                      </span>
                    </span>
                    <span className="text-sm font-extrabold whitespace-nowrap tabular-nums">{formatPrice(w.price)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {role === "friend" ? (
        <Card className="gap-4 rounded-3xl py-4 shadow-none">
          <CardHeader className="px-4">
            <CardTitle>Подарю что-то своё по теме</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 px-4">
            {theme.pledges.length ? (
              <PeopleList people={theme.pledges} onRemove={onUnpledge} removeLabel="Убрать" />
            ) : (
              <p className="text-muted-foreground text-sm">Пока никто не отметился. Напиши, что даришь, чтобы другие не повторились.</p>
            )}
            <form id="pledge-form" onSubmit={submit} className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="p-name">Твоё имя</Label>
                <Input id="p-name" required maxLength={40} value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-text">Что подаришь</Label>
                <Input id="p-text" required maxLength={140} value={text} onChange={(e) => setText(e.target.value)} placeholder="Например, перчатки для картинга" />
              </div>
              <SheetFooter>
                <Button type="submit" form="pledge-form" size="lg" className="w-full" disabled={busy}>
                  Отметить, что дарю
                </Button>
              </SheetFooter>
              <p className="text-muted-foreground text-xs">Остальные друзья увидят, {ownerName || "владелец списка"} нет.</p>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          <Separator />
          <p className="text-muted-foreground text-sm">Друзья могут отметить, что дарят что-то своё по этой теме. Тебе эти отметки не видны.</p>
          <ConfirmButton question="Удалить тематику? Желания останутся." confirmLabel="Удалить" onConfirm={onDelete}>
            <Trash2 />
            Удалить тематику
          </ConfirmButton>
        </>
      )}
    </div>
  )
}
