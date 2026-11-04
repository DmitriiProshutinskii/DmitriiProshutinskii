import type { LinkPreview, Settings, ThemeInput, WishInput, WishlistView } from "./types"

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string
  ) {
    super(code)
  }
}

const MESSAGES: Record<string, string> = {
  already_taken: "Кто-то уже успел это забронировать",
  already_yours: "Ты уже это бронировал",
  wrong_password: "Неверный пароль",
  list_not_found: "Ссылка устарела. Попроси новую у владельца списка",
  too_large: "Файл слишком большой, нужен до 6 МБ",
  bad_image: "Это не похоже на картинку",
  network: "Нет связи с сервером. Проверь интернет",
}
export const errorText = (e: unknown) => MESSAGES[(e as ApiError)?.code] ?? "Что-то пошло не так, попробуй ещё раз"

/** Everything the page can ask for. Owners and friends get different implementations of the same shape. */
export interface Backend {
  load(): Promise<WishlistView>
  // owner
  login(password: string): Promise<void>
  logout(): Promise<void>
  addWish(input: WishInput): Promise<WishlistView>
  updateWish(id: string, input: WishInput): Promise<WishlistView>
  deleteWish(id: string): Promise<WishlistView>
  addTheme(input: ThemeInput): Promise<WishlistView>
  deleteTheme(id: string): Promise<WishlistView>
  saveSettings(settings: Settings): Promise<WishlistView>
  rotateFriendLink(): Promise<WishlistView>
  uploadPhoto(file: Blob): Promise<string>
  preview(url: string): Promise<LinkPreview>
  // friend
  reserve(wishId: string, by: string, note: string): Promise<WishlistView>
  unreserve(wishId: string, reservationId: string): Promise<WishlistView>
  pledge(themeId: string, by: string, text: string): Promise<WishlistView>
  unpledge(themeId: string, pledgeId: string): Promise<WishlistView>
}

const storage = {
  get(key: string) {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value)
    } catch {
      /* private mode etc. */
    }
  },
}
export { storage }

/** Anonymous per-browser id so a friend can cancel their own reservation. */
function clientId() {
  let id = storage.get("wl_client")
  if (!id) {
    id = crypto.randomUUID()
    storage.set("wl_client", id)
  }
  return id
}

async function request<T>(method: string, path: string, body?: unknown, headers: Record<string, string> = {}): Promise<T> {
  let res: Response
  try {
    const isBlob = body instanceof Blob
    res = await fetch(path, {
      method,
      credentials: "same-origin",
      headers: { ...(body !== undefined && !isBlob ? { "content-type": "application/json" } : {}), ...headers },
      body: body === undefined ? undefined : isBlob ? body : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, "network")
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, data.error ?? "server_error")
  return data as T
}

const unsupported = () => Promise.reject(new ApiError(403, "forbidden"))

export class OwnerApi implements Backend {
  load = () => request<WishlistView>("GET", "/api/owner")
  login = (password: string) => request<void>("POST", "/api/owner/login", { password })
  logout = () => request<void>("POST", "/api/owner/logout")
  addWish = (input: WishInput) => request<WishlistView>("POST", "/api/owner/wishes", input)
  updateWish = (id: string, input: WishInput) => request<WishlistView>("PUT", `/api/owner/wishes/${id}`, input)
  deleteWish = (id: string) => request<WishlistView>("DELETE", `/api/owner/wishes/${id}`)
  addTheme = (input: ThemeInput) => request<WishlistView>("POST", "/api/owner/themes", input)
  deleteTheme = (id: string) => request<WishlistView>("DELETE", `/api/owner/themes/${id}`)
  saveSettings = (s: Settings) => request<WishlistView>("PUT", "/api/owner/settings", s)
  rotateFriendLink = () => request<WishlistView>("POST", "/api/owner/friend-link")
  uploadPhoto = async (file: Blob) => (await request<{ url: string }>("POST", "/api/owner/upload", file)).url
  preview = (url: string) => request<LinkPreview>("POST", "/api/owner/preview", { url })
  reserve = unsupported
  unreserve = unsupported
  pledge = unsupported
  unpledge = unsupported
}

export class FriendApi implements Backend {
  private readonly base: string
  private readonly headers: Record<string, string>

  constructor(token: string) {
    this.base = `/api/f/${encodeURIComponent(token)}`
    this.headers = { "x-client-id": clientId() }
  }

  private call = <T,>(method: string, path: string, body?: unknown) => request<T>(method, this.base + path, body, this.headers)

  load = () => this.call<WishlistView>("GET", "")
  reserve = (wishId: string, by: string, note: string) => this.call<WishlistView>("POST", `/wishes/${wishId}/reservations`, { by, note })
  unreserve = (wishId: string, id: string) => this.call<WishlistView>("DELETE", `/wishes/${wishId}/reservations/${id}`)
  pledge = (themeId: string, by: string, text: string) => this.call<WishlistView>("POST", `/themes/${themeId}/pledges`, { by, text })
  unpledge = (themeId: string, id: string) => this.call<WishlistView>("DELETE", `/themes/${themeId}/pledges/${id}`)
  login = unsupported
  logout = unsupported
  addWish = unsupported
  updateWish = unsupported
  deleteWish = unsupported
  addTheme = unsupported
  deleteTheme = unsupported
  saveSettings = unsupported
  rotateFriendLink = unsupported
  uploadPhoto = unsupported
  preview = unsupported
}
