import type { Currency, Priority, ThemeColor, Wish } from "./types"

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

export const CURRENCY_SIGN: Record<Currency, string> = { RUB: "₽", USD: "$", EUR: "€" }

/** «919 ₽», «140 $», «299,99 $» — Russian formatting, kopecks/cents only when there are any. */
export const formatPrice = (n: number | null, currency: Currency = "RUB") => {
  if (n === null) return "Цена не указана"
  const digits = Number.isInteger(n) ? 0 : 2
  const num = new Intl.NumberFormat("ru-RU", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)
  return `${num} ${CURRENCY_SIGN[currency]}`
}

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

/** No longer needed: the owner bought it, fixed the old one, etc. */
export const isDone = (w: Wish) => !!w.done

/** Reasons offered when the owner marks a wish as no longer needed. */
export const DONE_PRESETS = ["Купил", "Подарили", "Починил", "Передумал"]

/**
 * Wishes still wanted first, highest priority first; within a priority, the order the owner added them
 * (Array.sort is stable). Finished ones go last.
 */
export const byPriority = (a: Wish, b: Wish) => Number(isDone(a)) - Number(isDone(b)) || b.priority - a.priority
