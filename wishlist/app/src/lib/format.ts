import type { Priority, ThemeColor, Wish } from "./types"

export const PRIORITY_LABEL: Record<Priority, string> = {
  3: "Очень хочу",
  2: "Хочу",
  1: "Было бы неплохо",
}

export const COLOR_LABEL: Record<ThemeColor, string> = {
  red: "Красный",
  brown: "Коричневый",
  blue: "Синий",
  green: "Зелёный",
}

const rub = new Intl.NumberFormat("ru-RU")
export const formatPrice = (n: number | null) => (n === null ? "Цена не указана" : `${rub.format(n)} ₽`)

export const domainOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return ""
  }
}

export const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

/** A single-gift wish is taken once anyone reserves it; multi-gift wishes never are. */
export const isTaken = (w: Wish) => !w.multi && w.reservations.length > 0

export const byPriority = (a: Wish, b: Wish) => b.priority - a.priority || (b.price ?? 0) - (a.price ?? 0)
