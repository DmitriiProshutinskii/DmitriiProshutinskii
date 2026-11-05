import { illustrations } from "@/lib/illustrations"
import type { Wish } from "@/lib/types"
import { cn } from "@/lib/utils"

export function WishPhoto({
  wish,
  className,
  fit = "cover",
}: {
  wish: Pick<Wish, "photo" | "illustration" | "title">
  className?: string
  /** "contain" shows the whole product, e.g. in the wider detail view. */
  fit?: "cover" | "contain"
}) {
  if (wish.photo)
    return <img src={wish.photo} alt="" className={cn("absolute inset-0 size-full", fit === "cover" ? "object-cover" : "object-contain", className)} />
  const art = wish.illustration ? illustrations[wish.illustration] : null
  if (art) return <span className={cn("block size-[74%]", className)} dangerouslySetInnerHTML={{ __html: art }} />
  return (
    <span aria-hidden="true" className="font-display text-muted-foreground text-4xl">
      {wish.title.charAt(0)}
    </span>
  )
}
