import { useSyncExternalStore } from "react"

const root = document.documentElement
const media = window.matchMedia("(prefers-color-scheme: dark)")

function apply() {
  const explicit = root.getAttribute("data-theme")
  root.classList.toggle("dark", explicit ? explicit === "dark" : media.matches)
}

/** Keeps the `.dark` class (what shadcn styles key off) in sync with the OS setting and an explicit data-theme. */
export function initThemeSync() {
  apply()
  media.addEventListener("change", apply)
  new MutationObserver(apply).observe(root, { attributes: true, attributeFilter: ["data-theme"] })
}

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb)
  mo.observe(root, { attributes: true, attributeFilter: ["class"] })
  return () => mo.disconnect()
}

export function useIsDark() {
  return useSyncExternalStore(subscribe, () => root.classList.contains("dark"))
}
