import { useState, type FormEvent } from "react"
import { Copy, LogOut, Plus, RefreshCw, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ConfirmButton } from "@/components/wish/confirm-button"
import type { Param, Settings } from "@/lib/types"
import { SheetFooter } from "@/components/wish/responsive-sheet"

interface Props {
  settings: Settings
  friendLink: string
  onSave: (s: Settings) => Promise<boolean>
  onRotateLink: () => void
  onLogout?: () => void
}

export function copyText(text: string, done: string) {
  try {
    navigator.clipboard.writeText(text).then(
      () => toast(done),
      () => toast(text)
    )
  } catch {
    toast(text)
  }
}

export function SettingsForm({ settings, friendLink, onSave, onRotateLink, onLogout }: Props) {
  const [title, setTitle] = useState(settings.title)
  const [ownerName, setOwnerName] = useState(settings.ownerName)
  const [params, setParams] = useState<Param[]>(settings.params.length ? settings.params : [{ label: "", value: "" }])
  const [busy, setBusy] = useState(false)

  const setParam = (i: number, patch: Partial<Param>) => setParams((ps) => ps.map((p, j) => (j === i ? { ...p, ...patch } : p)))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    await onSave({ title: title.trim(), ownerName: ownerName.trim(), params: params.filter((p) => p.label.trim() || p.value.trim()) })
    setBusy(false)
  }

  return (
    <div className="grid gap-6">
      <form id="settings-form" onSubmit={submit} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="s-title">Название списка</Label>
            <Input id="s-title" required maxLength={60} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="s-owner">Как тебя называть</Label>
            <Input id="s-owner" maxLength={40} value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Например, Дима" />
          </div>
        </div>

        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-semibold">Параметры</legend>
          <p className="text-muted-foreground -mt-1 mb-1 text-xs">Размеры, любимые цвета, что не дарить. Друзья увидят их над списком.</p>
          {params.map((p, i) => (
            <div key={i} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] gap-2">
              <Input aria-label="Название параметра" maxLength={40} value={p.label} onChange={(e) => setParam(i, { label: e.target.value })} placeholder="Обувь" />
              <Input aria-label="Значение" maxLength={120} value={p.value} onChange={(e) => setParam(i, { value: e.target.value })} placeholder="43" />
              <Button type="button" variant="ghost" size="icon" className="size-10" aria-label="Убрать параметр" onClick={() => setParams((ps) => ps.filter((_, j) => j !== i))}>
                <X />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" className="justify-self-start" onClick={() => setParams((ps) => [...ps, { label: "", value: "" }])}>
            <Plus />
            Добавить параметр
          </Button>
        </fieldset>

        <SheetFooter>
          <Button type="submit" form="settings-form" size="lg" className="w-full" disabled={busy}>
            Сохранить
          </Button>
        </SheetFooter>
      </form>

      <Separator />

      <div className="grid gap-3">
        <div className="grid gap-1">
          <span className="text-sm font-semibold">Ссылка для друзей</span>
          <span className="text-muted-foreground text-xs">По ней смотрят и бронируют. Пароль не нужен.</span>
        </div>
        <div className="flex gap-2">
          <Input readOnly value={friendLink} onFocus={(e) => e.target.select()} className="min-w-0 font-mono text-xs" aria-label="Ссылка для друзей" />
          <Button type="button" className="h-10 shrink-0" onClick={() => copyText(friendLink, "Ссылка скопирована")}>
            <Copy />
            Копировать
          </Button>
        </div>
        <ConfirmButton question="Старая ссылка перестанет работать. Брони сохранятся." confirmLabel="Сменить" onConfirm={onRotateLink}>
          <RefreshCw />
          Сменить ссылку
        </ConfirmButton>
      </div>

      {onLogout && (
        <>
          <Separator />
          <Button variant="ghost" className="justify-self-start" onClick={onLogout}>
            <LogOut />
            Выйти
          </Button>
        </>
      )}
    </div>
  )
}
