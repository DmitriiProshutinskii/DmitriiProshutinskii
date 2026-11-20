import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { errorText, type ApiError, type Backend } from "@/lib/backend"
import type { WishlistView } from "@/lib/types"

export type Status = "loading" | "ready" | "login" | "error"

export function useWishlist(backend: Backend, { refreshOnFocus = false } = {}) {
  const [view, setView] = useState<WishlistView | null>(null)
  const [status, setStatus] = useState<Status>("loading")
  const [error, setError] = useState<unknown>(null)

  const reload = useCallback(async () => {
    try {
      setView(await backend.load())
      setStatus("ready")
    } catch (e) {
      if ((e as ApiError).status === 401) setStatus("login")
      else {
        setError(e)
        setStatus("error")
      }
    }
  }, [backend])

  useEffect(() => {
    // Drop the previous backend's data at once: in the preview, switching versions must never
    // show the owner even a frame of the friends' view.
    setView(null)
    setStatus("loading")
    reload()
  }, [reload])

  // Friends keep the page open for a while; pick up others' reservations when they come back to it.
  useEffect(() => {
    if (!refreshOnFocus) return
    const onVisible = () => document.visibilityState === "visible" && reload()
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [refreshOnFocus, reload])

  /** Runs a change, swaps in the fresh view, reports errors. Resolves to whether it worked. */
  const run = useCallback(
    async (fn: (b: Backend) => Promise<WishlistView>, success?: string) => {
      try {
        setView(await fn(backend))
        if (success) toast(success)
        return true
      } catch (e) {
        const status = (e as ApiError).status
        if (status === 401) setStatus("login")
        toast.error(errorText(e))
        if (status === 409 || status === 404) reload()
        return false
      }
    },
    [backend, reload]
  )

  return { view, status, error, reload, run, setStatus }
}
