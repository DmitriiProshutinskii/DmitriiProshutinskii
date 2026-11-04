import { useState, type FormEvent } from "react"
import { Gift, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { errorText } from "@/lib/backend"

export function LoginScreen({ onLogin }: { onLogin: (password: string) => Promise<void> }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      await onLogin(password)
    } catch (err) {
      setError(errorText(err))
    }
    setBusy(false)
  }

  return (
    <div className="grid min-h-dvh place-items-center pr-[max(16px,env(safe-area-inset-right,0px))] pl-[max(16px,env(safe-area-inset-left,0px))]">
      <Card className="w-full max-w-sm rounded-3xl">
        <CardHeader>
          <span className="bg-hot-soft text-hot mb-2 grid size-11 place-items-center rounded-full">
            <Gift className="size-5" />
          </span>
          <CardTitle className="font-display text-2xl">Вишлист</CardTitle>
          <CardDescription>Вход для владельца списка. Друзьям пароль не нужен, у них своя ссылка.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!error} />
              {error && <p className="text-destructive text-sm font-semibold">{error}</p>}
            </div>
            <Button type="submit" size="lg" className="rounded-xl" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              Войти
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
