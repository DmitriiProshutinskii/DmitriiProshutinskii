import { useState, type ChangeEvent, type FormEvent } from "react"
import { ImagePlus, Loader2, Sparkles, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { errorText } from "@/lib/backend"
import { CURRENCY_SIGN, PRIORITY_LABEL } from "@/lib/format"
import { shrinkImage } from "@/lib/images"
import { illustrations } from "@/lib/illustrations"
import { CURRENCIES, type Currency, type LinkPreview, type Priority, type Theme, type Wish, type WishInput } from "@/lib/types"
import { cn } from "@/lib/utils"
import { SheetFooter } from "@/components/wish/responsive-sheet"

const pill =
  "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent"

interface Props {
  themes: Theme[]
  initial?: Wish
  submitLabel: string
  onUpload: (file: Blob) => Promise<string>
  onPreview: (url: string) => Promise<LinkPreview>
  onSubmit: (input: WishInput) => Promise<boolean>
}

export function WishForm({ themes, initial, submitLabel, onUpload, onPreview, onSubmit }: Props) {
  const [photo, setPhoto] = useState<string | null>(initial?.photo ?? null)
  const [title, setTitle] = useState(initial?.title ?? "")
  const [url, setUrl] = useState(initial?.url ?? "")
  const [price, setPrice] = useState(initial?.price != null ? String(initial.price) : "")
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? "RUB")
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 2)
  const [multi, setMulti] = useState(initial?.multi ?? false)
  const [themeIds, setThemeIds] = useState<string[]>(initial?.themeIds ?? [])
  const [note, setNote] = useState(initial?.note ?? "")
  const [uploading, setUploading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [busy, setBusy] = useState(false)
  const placeholderArt = !photo && initial?.illustration ? illustrations[initial.illustration] : null

  const pickPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setUploading(true)
    try {
      setPhoto(await onUpload(await shrinkImage(file)))
    } catch (err) {
      toast.error(errorText(err))
    }
    setUploading(false)
  }

  const fetchFromLink = async () => {
    if (!/^https?:\/\//.test(url.trim())) return toast.error("Сначала вставь ссылку на товар")
    setFetching(true)
    try {
      const p = await onPreview(url.trim())
      if (p.title && !title.trim()) setTitle(p.title)
      if (p.price && !price) {
        setPrice(String(p.price))
        if (p.currency) setCurrency(p.currency)
      }
      if (p.photo && !photo) setPhoto(p.photo)
      const got = [p.title && "название", p.price && "цену", p.photo && "фото"].filter(Boolean)
      if (got.length) toast(`Подтянули ${got.join(", ")}`)
      else toast("Магазин не отдал данные. Заполни вручную")
    } catch (err) {
      toast.error(errorText(err))
    }
    setFetching(false)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || busy) return
    setBusy(true)
    await onSubmit({
      title: title.trim(),
      url: url.trim(),
      price: price === "" ? null : Number(price),
      currency,
      priority,
      multi,
      themeIds,
      note: note.trim(),
      photo,
    })
    setBusy(false)
  }

  return (
    <form id="wish-form" onSubmit={submit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="w-url">Ссылка на товар</Label>
        <div className="flex gap-2">
          <Input id="w-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" className="min-w-0" />
          <Button type="button" variant="secondary" onClick={fetchFromLink} disabled={fetching} className="h-10 shrink-0">
            {fetching ? <Loader2 className="animate-spin" /> : <Sparkles />}
            Подтянуть
          </Button>
        </div>
        <span className="text-muted-foreground text-xs">Попробуем взять из магазина название, цену и фото.</span>
      </div>

      <div className="grid grid-cols-[88px_1fr] items-center gap-3">
        <div className="bg-tile text-muted-foreground relative grid aspect-square place-items-center overflow-hidden rounded-lg">
          {photo ? (
            <img src={photo} alt="" className="size-full object-cover" />
          ) : placeholderArt ? (
            <span className="block size-[80%]" dangerouslySetInnerHTML={{ __html: placeholderArt }} />
          ) : (
            <ImagePlus className="size-7 opacity-60" />
          )}
          {uploading && (
            <span className="bg-scrim absolute inset-0 grid place-items-center">
              <Loader2 className="size-6 animate-spin" />
            </span>
          )}
        </div>
        <div className="grid gap-2">
          <span className="text-sm font-semibold">Фото</span>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild className="relative has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50">
              <label>
                <ImagePlus />
                {photo ? "Заменить" : "Загрузить фото"}
                <input type="file" accept="image/*" onChange={pickPhoto} className="sr-only" />
              </label>
            </Button>
            {photo && (
              <Button type="button" variant="ghost" onClick={() => setPhoto(null)}>
                <X />
                Убрать
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_250px]">
        <div className="grid gap-2">
          <Label htmlFor="w-title">Название</Label>
          <Input id="w-title" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Что хочется" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="w-price">Цена</Label>
          <div className="flex gap-2">
            <Input id="w-price" type="number" min={0} step="0.01" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className="min-w-0" />
            <ToggleGroup type="single" variant="outline" value={currency} onValueChange={(v) => v && setCurrency(v as Currency)} aria-label="Валюта" className="gap-1">
              {CURRENCIES.map((c) => (
                <ToggleGroupItem key={c} value={c} aria-label={c} className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground h-10 min-w-10 px-0">
                  {CURRENCY_SIGN[c]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
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

      <Label htmlFor="w-multi" className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-3.5">
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
        <Textarea id="w-note" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Размер, цвет, что точно не подойдёт" />
      </div>

      <SheetFooter>
        <Button type="submit" form="wish-form" size="lg" className="w-full" disabled={busy || uploading}>
          {submitLabel}
        </Button>
      </SheetFooter>
    </form>
  )
}
