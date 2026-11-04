import { Plus } from "lucide-react"

import { plural } from "@/lib/format"
import type { Role, Theme } from "@/lib/types"
import { cn } from "@/lib/utils"

const card =
  "text-foreground relative flex min-h-[124px] w-[min(72vw,240px)] shrink-0 snap-start flex-col gap-1.5 overflow-hidden rounded-3xl p-4 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"

export function ThemeCard({ theme, ideas, role, onOpen }: { theme: Theme; ideas: number; role: Role; onOpen: () => void }) {
  const mine = role === "friend" && theme.pledges.some((p) => p.mine)
  const others = role === "friend" ? theme.pledges.filter((p) => !p.mine).length : 0
  return (
    <button type="button" onClick={onOpen} className={cn(card, `th-${theme.color}`, "bg-th-soft", theme.flag && "flag-corner")}>
      <span className="font-display text-th pr-10 text-[17px] font-bold tracking-tight">{theme.name}</span>
      {theme.description && <span className="text-muted-foreground line-clamp-2 text-sm">{theme.description}</span>}
      <span className="mt-auto flex flex-wrap gap-x-3 pt-2 text-[13px] font-bold">
        {ideas > 0 ? `${ideas} ${plural(ideas, "идея", "идеи", "идей")}` : "Своя идея"}
        {mine && <span className="text-mine">ты даришь</span>}
        {others > 0 && <span className="text-th">{mine ? `и ещё ${others}` : `дарят: ${others}`}</span>}
      </span>
    </button>
  )
}

export function AddThemeCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(card, "border-border text-muted-foreground items-center justify-center border-2 border-dashed text-center font-semibold hover:bg-muted/50")}
    >
      <span className="bg-muted text-foreground grid size-11 place-items-center rounded-full">
        <Plus className="size-5" />
      </span>
      Новая тематика
    </button>
  )
}
