import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { COLOR_LABEL } from "@/lib/format"
import type { Theme, ThemeColor } from "@/lib/types"
import { cn } from "@/lib/utils"

export function NewThemeForm({ onSubmit }: { onSubmit: (theme: Omit<Theme, "id" | "pledges">) => void }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState<ThemeColor>("green")

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), description: description.trim() || "Что угодно по теме.", color })
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="t-name">Название</Label>
        <Input id="t-name" required maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, Настолки" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="t-desc">Что подойдёт</Label>
        <Textarea
          id="t-desc"
          maxLength={200}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Любые кооперативные игры, дополнения к «Каркассону»"
        />
      </div>
      <div className="grid gap-2">
        <Label>Цвет</Label>
        <RadioGroup value={color} onValueChange={(v) => setColor(v as ThemeColor)} className="flex flex-wrap gap-2">
          {(Object.keys(COLOR_LABEL) as ThemeColor[]).map((c) => (
            <Label
              key={c}
              htmlFor={`t-color-${c}`}
              className={cn(
                `th-${c}`,
                "has-[[data-state=checked]]:border-th has-[[data-state=checked]]:bg-th-soft has-[:focus-visible]:ring-ring/50 flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold has-[:focus-visible]:ring-[3px]"
              )}
            >
              <RadioGroupItem value={c} id={`t-color-${c}`} className="sr-only" />
              <span className="bg-th size-3 rounded-full" />
              {COLOR_LABEL[c]}
            </Label>
          ))}
        </RadioGroup>
      </div>
      <Button type="submit" size="lg" className="w-full rounded-xl">
        Создать тематику
      </Button>
    </form>
  )
}
