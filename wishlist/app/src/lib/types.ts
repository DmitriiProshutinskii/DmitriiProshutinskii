export type Role = "owner" | "friend"
export type Priority = 1 | 2 | 3
export type ThemeColor = "red" | "brown" | "blue" | "green"
export type Currency = "RUB" | "USD" | "EUR"
export const CURRENCIES: Currency[] = ["RUB", "USD", "EUR"]

export interface Reservation {
  id: string
  by: string
  note: string
  /** Made by the current visitor, so they can cancel it. */
  mine: boolean
}

export interface Wish {
  id: string
  title: string
  url: string
  price: number | null
  /** Missing means roubles (older data). */
  currency?: Currency
  priority: Priority
  /** «Можно больше, чем один» — several friends can reserve it. */
  multi: boolean
  themeIds: string[]
  note: string
  /** Photo URL: uploaded file, image fetched from the shop page, or a data URL in the demo. */
  photo: string | null
  /** Placeholder drawing used by the demo data. */
  illustration?: string | null
  /** Friend view only. The owner's API never returns reservations. */
  reservations: Reservation[]
}

export interface Pledge {
  id: string
  by: string
  text: string
  mine: boolean
}

export interface Theme {
  id: string
  name: string
  description: string
  color: ThemeColor
  flag?: boolean
  /** Friends' notes like «дарю кепку McLaren». Friend view only. */
  pledges: Pledge[]
}

export interface Param {
  label: string
  value: string
}

/** What the page renders, for either role. */
export interface WishlistView {
  title: string
  /** How friends see the owner named in hints, e.g. «Дима не узнает». */
  ownerName: string
  params: Param[]
  themes: Theme[]
  wishes: Wish[]
  /** Owner view only: path of the friends' link, e.g. /f/abc123. */
  friendPath?: string
}

export type WishInput = Pick<Wish, "title" | "url" | "price" | "currency" | "priority" | "multi" | "themeIds" | "note" | "photo">
export type ThemeInput = Pick<Theme, "name" | "description" | "color">

export interface Settings {
  title: string
  ownerName: string
  params: Param[]
}

export interface LinkPreview {
  title?: string
  price?: number
  currency?: Currency
  photo?: string
}

export const COLORS: ThemeColor[] = ["red", "brown", "blue", "green"]
