import { Check, CircleCheck, Layers, Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { WishPhoto } from "@/components/wish/wish-photo"
import { domainOf, formatPrice, isDone, isTaken } from "@/lib/format"
import type { Role, Wish } from "@/lib/types"
import { cn } from "@/lib/utils"

const tileButton =
  "group text-foreground flex min-w-0 flex-col gap-2 rounded-2xl text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"

export function WishTile({ wish, role, onOpen }: { wish: Wish; role: Role; onOpen: () => void }) {
  const friend = role === "friend"
  // No longer needed («Купил», «Починил»): greyed out like a sold-out item in a shop.
  const done = isDone(wish)
  const hot = wish.priority === 3 && !done
  const mine = friend && !done && wish.reservations.some((r) => r.mine)
  // Someone else took it. Your own reservation is shown differently, so you can find it again.
  const takenByOther = friend && !done && isTaken(wish) && !mine
  const muted = done || takenByOther
  const givers = wish.reservations.length
  const domain = domainOf(wish.url)

  let multiLabel = "Можно несколько"
  if (friend && mine) multiLabel = givers > 1 ? `Ты и ещё ${givers - 1}` : "Ты даришь"
  else if (friend && givers) multiLabel = `Несколько · дарят ${givers}`

  return (
    <button type="button" onClick={onOpen} className={tileButton}>
      <div
        className={cn(
          "bg-tile relative grid aspect-square place-items-center overflow-hidden rounded-2xl transition group-hover:brightness-[.97] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:content-['']",
          hot && "bg-hot-soft after:ring-2 after:ring-inset after:ring-hot",
          wish.photo && "bg-white",
          mine && "after:ring-mine after:ring-[3px] after:ring-inset"
        )}
      >
        <WishPhoto wish={wish} className={cn(muted && "opacity-50 grayscale")} />
        {hot && (
          <Badge variant="hot" className="absolute top-2.5 left-2.5">
            Очень хочу
          </Badge>
        )}
        {wish.multi && !done && (
          <Badge
            variant="outline"
            className={cn("absolute bottom-2.5 left-2.5 border-transparent shadow-sm", mine && "bg-mine text-mine-foreground")}
          >
            {mine ? <Check /> : <Layers />}
            {multiLabel}
          </Badge>
        )}
        {takenByOther && (
          <div className="bg-scrim absolute inset-0 grid place-items-center">
            <Badge className="px-3 py-1">Забронировано</Badge>
          </div>
        )}
        {done && (
          <div className="bg-scrim absolute inset-0 grid place-items-center">
            <Badge variant="outline" className="max-w-[90%] truncate px-3 py-1">
              <CircleCheck />
              {wish.done}
            </Badge>
          </div>
        )}
        {mine && !wish.multi && (
          <Badge className="bg-mine text-mine-foreground absolute bottom-2.5 left-2.5 px-2.5 py-1">
            <Check />
            Ты даришь
          </Badge>
        )}
      </div>
      <div className={cn("line-clamp-2 px-1 text-[15px] leading-snug font-semibold", muted && "text-muted-foreground")}>
        {wish.title}
      </div>
      <div className="grid gap-0.5 px-1">
        {wish.price === null ? (
          <span className="text-muted-foreground text-[13px] font-medium">Цена не указана</span>
        ) : (
          <span className={cn("text-[15px] font-bold tabular-nums", muted && "text-muted-foreground", done && "line-through")}>
            {formatPrice(wish.price, wish.currency)}
          </span>
        )}
        {domain && <span className="text-muted-foreground truncate text-[13px]">{domain}</span>}
      </div>
    </button>
  )
}

export function AddWishTile({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={tileButton}>
      <div className="border-border grid aspect-square place-items-center rounded-2xl border-2 border-dashed transition group-hover:bg-muted/50">
        <div className="grid justify-items-center gap-2.5 font-semibold">
          <span className="bg-muted grid size-12 place-items-center rounded-lg">
            <Plus className="size-5" />
          </span>
          Добавить желание
        </div>
      </div>
    </button>
  )
}
