import { illustrations } from "@/lib/illustrations"
import type { Wish } from "@/lib/types"
import { cn } from "@/lib/utils"

export function WishPhoto({ wish, className }: { wish: Pick<Wish, "photo" | "illustration" | "title">; className?: string }) {
  if (wish.photo) return <img src={wish.photo} alt="" className="size-full object-cover" />
  const art = wish.illustration ? illustrations[wish.illustration] : null
  if (art) return <span className={cn("block size-[74%]", className)} dangerouslySetInnerHTML={{ __html: art }} />
  return (
    <span aria-hidden="true" className="font-display text-muted-foreground text-4xl">
      {wish.title.charAt(0)}
    </span>
  )
}
