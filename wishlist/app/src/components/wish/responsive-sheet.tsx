import type { ReactNode } from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  eyebrow: string
  title: string
  children: ReactNode
}

/** shadcn "responsive dialog" pattern: Dialog on wide screens, bottom Drawer on phones. */
export function ResponsiveSheet({ open, onOpenChange, eyebrow, title, children }: Props) {
  const desktop = useMediaQuery("(min-width: 640px)")
  const eyebrowCls = "text-xs font-bold tracking-wider uppercase"
  const titleCls = "text-xl leading-tight font-extrabold text-balance"

  if (desktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90dvh] gap-5 overflow-y-auto rounded-3xl p-5 sm:max-w-[540px]">
          <DialogHeader className="pr-10 text-left">
            <DialogDescription className={eyebrowCls}>{eyebrow}</DialogDescription>
            <DialogTitle className={titleCls}>{title}</DialogTitle>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerDescription className={eyebrowCls}>{eyebrow}</DrawerDescription>
          <DrawerTitle className={titleCls}>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}
