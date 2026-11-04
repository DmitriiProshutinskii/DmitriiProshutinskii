export type Role = "owner" | "friend"
export type Priority = 1 | 2 | 3
export type ThemeColor = "red" | "brown" | "blue" | "green"

export interface Reservation {
  by: string
  note: string
  /** In the mockup: made by the current visitor, so they can cancel it. */
  mine: boolean
}

export interface Wish {
  id: string
  title: string
  url: string
  price: number | null
  priority: Priority
  /** «Можно больше, чем один» — several friends can reserve it. */
  multi: boolean
  themeIds: string[]
  note?: string
  /** Uploaded photo (data URL). */
  photo?: string | null
  /** Placeholder drawing used until real photos are fetched from the shop link. */
  illustration?: string | null
  reservations: Reservation[]
}

export interface Pledge {
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
  /** Friends' notes like «дарю кепку McLaren». Never shown to the owner. */
  pledges: Pledge[]
}

export interface Param {
  label: string
  value: string
}
