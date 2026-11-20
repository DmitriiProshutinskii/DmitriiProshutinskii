import { useState, type ReactNode } from "react"

import { Button } from "@/components/ui/button"

/** Two-step destructive action: first press asks, second press does it. */
export function ConfirmButton({ children, question, confirmLabel, onConfirm }: { children: ReactNode; question: string; confirmLabel: string; onConfirm: () => void }) {
  const [asking, setAsking] = useState(false)
  if (!asking)
    return (
      <Button variant="ghost" className="text-destructive hover:text-destructive justify-self-start" onClick={() => setAsking(true)}>
        {children}
      </Button>
    )
  return (
    <div className="bg-muted flex flex-wrap items-center gap-2 rounded-lg p-2 pl-3 text-sm">
      <span className="mr-auto font-semibold">{question}</span>
      <Button variant="ghost" onClick={() => setAsking(false)}>
        Отмена
      </Button>
      <Button variant="destructive" onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </div>
  )
}
