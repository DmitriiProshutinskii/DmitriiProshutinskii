import { useState, type ChangeEvent, type FormEvent } from "react"
import { ImagePlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { PRIORITY_LABEL } from "@/lib/format"
import type { Priority, Theme, Wish } from "@/lib/types"
import { cn } from "@/lib/utils"

const pill =
  "flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent"

export function NewWishForm({ themes, onSubmit }: { themes: Theme[]; onSubmit: (wish: Omit<Wish, "id" | "reservations">) => void }) {
  const [photo, setPhoto] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [price, setPrice] = useState("")
  const [priority, setPriority] = useState<Priority>(2)
  const [multi, setMulti] = useState(false)
  const [themeIds, setThemeIds] = useState<string[]>([])
  const [note, setNote] = useState("")

  const pickPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(String(reader.result))
    reader.readAsDataURL(file)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      url: url.trim(),
      price: price === "" ? null : Number(price),
      priority,
      multi,
      themeIds,
      note: note.trim(),
      photo,
      illustration: null,
    })
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid grid-cols-[88px_1fr] items-center gap-3">
        <div className="bg-tile text-muted-foreground grid aspect-square place-items-center overflow-hidden rounded-2xl">
          {photo ? <img src={photo} alt="" className="size-full object-cover" /> : <ImagePlus className="size-7 opacity-60" />}
        </div>
        <div className="grid gap-2">
          <span className="text-sm font-semibold">Фото</span>
          <Button variant="outline" asChild className="relative justify-self-start has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50">
            <label>
              <ImagePlus />
              {photo ? "Заменить фото" : "Загрузить фото"}
              <input type="file" accept="image/*" onChange={pickPhoto} className="sr-only" />
            </label>
          </Button>
          <span className="text-muted-foreground text-xs">Можно не загружать: на сайте фото подтянется по ссылке.</span>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="w-title">Название</Label>
        <Input id="w-title" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Что хочется" />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
        <div className="grid gap-2">
          <Label htmlFor="w-url">Ссылка</Label>
          <Input id="w-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="w-price">Цена, ₽</Label>
          <Input id="w-price" type="number" min={0} step={1} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Приоритет</Label>
        <RadioGroup value={String(priority)} onValueChange={(v) => setPriority(Number(v) as Priority)} className="flex flex-wrap gap-2">
          {([3, 2, 1] as Priority[]).map((p) => (
            <Label
              key={p}
              htmlFor={`w-pri-${p}`}
              className={cn(pill, p === 3 && "has-[[data-state=checked]]:border-hot has-[[data-state=checked]]:bg-hot-soft")}
            >
              <RadioGroupItem value={String(p)} id={`w-pri-${p}`} />
              {PRIORITY_LABEL[p]}
            </Label>
          ))}
        </RadioGroup>
      </div>

      <Label htmlFor="w-multi" className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-3.5">
        <span className="grid gap-1">
          Можно больше, чем один
          <span className="text-muted-foreground text-xs font-medium">Забронировать смогут несколько друзей</span>
        </span>
        <Switch id="w-multi" checked={multi} onCheckedChange={setMulti} />
      </Label>

      {themes.length > 0 && (
        <div className="grid gap-2">
          <Label>Тематики</Label>
          <div className="flex flex-wrap gap-2">
            {themes.map((t) => (
              <Label key={t.id} htmlFor={`w-th-${t.id}`} className={cn(pill, `th-${t.color}`, "has-[[data-state=checked]]:border-th has-[[data-state=checked]]:bg-th-soft")}>
                <Checkbox
                  id={`w-th-${t.id}`}
                  checked={themeIds.includes(t.id)}
                  onCheckedChange={(c) => setThemeIds((ids) => (c ? [...ids, t.id] : ids.filter((x) => x !== t.id)))}
                />
                {t.name}
              </Label>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="w-note">Комментарий для друзей</Label>
        <Textarea id="w-note" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Размер, цвет, что точно не подойдёт" />
      </div>

      <Button type="submit" size="lg" className="w-full rounded-xl">
        Добавить
      </Button>
    </form>
  )
}
