import { createContext, useContext, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"

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

const FooterSlot = createContext<HTMLElement | null>(null)

/**
 * Puts its children in the sheet's fixed footer, outside the scrolling area, so the main action
 * is always visible and never covers a field. Buttons there reach their form via the `form` attribute.
 */
export function SheetFooter({ children }: { children: ReactNode }) {
  const slot = useContext(FooterSlot)
  return slot ? createPortal(children, slot) : <>{children}</>
}

/** shadcn "responsive dialog" pattern: Dialog on wide screens, bottom Drawer on phones. */
export function ResponsiveSheet({ open, onOpenChange, eyebrow, title, children }: Props) {
  const desktop = useMediaQuery("(min-width: 640px)")
  const [footer, setFooter] = useState<HTMLDivElement | null>(null)
  const eyebrowCls = "text-xs font-bold tracking-wider uppercase"
  const titleCls = "text-xl leading-tight font-extrabold text-balance"
  const footerCls = "grid gap-2 border-t bg-background empty:hidden"

  if (desktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-[540px]">
          <DialogHeader className="px-5 pt-5 pr-14 pb-4 text-left">
            <DialogDescription className={eyebrowCls}>{eyebrow}</DialogDescription>
            <DialogTitle className={titleCls}>{title}</DialogTitle>
          </DialogHeader>
          <FooterSlot.Provider value={footer}>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
          </FooterSlot.Provider>
          <div ref={setFooter} className={`${footerCls} px-5 py-3`} />
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
        <FooterSlot.Provider value={footer}>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">{children}</div>
        </FooterSlot.Provider>
        <div ref={setFooter} className={`${footerCls} px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]`} />
      </DrawerContent>
    </Drawer>
  )
}
