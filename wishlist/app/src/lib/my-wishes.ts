import type { Currency, Param, Priority, ThemeColor } from "./types"

/**
 * Dmitrii's own list. One source for both:
 * - the clickable preview (src/lib/seed.ts), and
 * - the real site's first start: when the server finds no database yet, it creates it from this
 *   and downloads `photoUrl` into its uploads (server/starter.ts).
 * After the first start the site's data lives in its database; edit it on the site, not here.
 */

export interface StarterTheme {
  key: string
  name: string
  description: string
  color: ThemeColor
  /** Chequered-flag corner, for the racing theme. */
  flag?: boolean
}

export interface StarterWish {
  key: string
  title: string
  url: string
  price: number | null
  currency?: Currency
  priority: Priority
  multi: boolean
  themes: string[]
  note: string
  /** Shop photo the server downloads on first start. */
  photoUrl?: string
}

export const starter = {
  title: "Вишлист Димы",
  ownerName: "Дима",
  params: [
    { label: "Одежда", value: "M" },
    { label: "Обувь", value: "42,5 EU" },
  ] satisfies Param[],
  themes: [
    {
      key: "kart",
      name: "Картинг и F1",
      color: "red",
      flag: true,
      description: "Что угодно про F1 и картинг: модельки болидов, мерч команд, книги о гонках, перчатки, заезды.",
    },
    {
      key: "coffee",
      name: "Кофе",
      color: "brown",
      description: "Зерно для фильтра и всё, что связано с кофе.",
    },
  ] satisfies StarterTheme[],
  wishes: [
    {
      key: "cockpit",
      title: "Кокпит Fanatec CSL Cockpit V1.5",
      url: "https://checkout.fanatec.com/products/csl-cockpit-v1-5",
      price: 299.99,
      currency: "USD",
      priority: 3,
      multi: false,
      themes: ["kart"],
      note: "Под мой руль Fanatec GT DD Pro. Цена из официального магазина Fanatec.",
      photoUrl: "https://cdn.shopify.com/s/files/1/0696/8423/2344/files/CRD-9010009-WW-04.png",
    },
    {
      key: "coffee",
      title: "Кофе Tasty Coffee: Кения AA Маунт или Эфиопия Сидамо",
      url: "https://shop.tastycoffee.ru/coffee/kenya-aa-maunt",
      price: 919,
      priority: 2,
      multi: true,
      themes: ["coffee"],
      note: "Любой из двух, пачка 250 г. Эфиопия Сидамо (799 ₽): https://shop.tastycoffee.ru/coffee/ethiopia-sidamo",
      photoUrl: "https://s3.shop.tastycoffee.ru/coffee-static/files/shares/data/_newpack10/filter_mono/maunt-new.jpg",
    },
    {
      key: "nike-shoes",
      title: "Кроссовки Nike 24.7",
      url: "https://www.nike.com/t/24-7-mens-shoes-1UaK9D44/IR0447-001",
      price: 140,
      currency: "USD",
      priority: 2,
      multi: false,
      themes: [],
      note: "Размер 42,5 EU (US 9). Цвет чёрный: Black/Anthracite/Black.",
      photoUrl:
        "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/0755d867-7090-49cd-bceb-32862e39364d/NIKE+24.7+SNEAKER.png",
    },
    {
      key: "nike-crew",
      title: "Свитшот Nike 24.7 ImpossiblySoft",
      url: "https://www.nike.com/t/24-7-impossiblysoft-mens-dri-fit-crew-X6qnrK/HQ6964-212",
      price: 115,
      currency: "USD",
      priority: 2,
      multi: false,
      themes: [],
      note: "Размер M. Цвет Dark Hazel (тёмно-коричневый), в комплект к штанам.",
      photoUrl:
        "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/1fd38515-0e42-44b8-b2e4-ce1fb95b7a18/M+NK+DF+24.7+IS+CREW.png",
    },
    {
      key: "nike-pants",
      title: "Штаны Nike 24.7 ImpossiblySoft, прямые",
      url: "https://www.nike.com/t/24-7-impossiblysoft-mens-dri-fit-straight-leg-pants-WPHaCAzZ/IM3639-212",
      price: 115,
      currency: "USD",
      priority: 2,
      multi: false,
      themes: [],
      note: "Размер M. Цвет Dark Hazel, в комплект к свитшоту.",
      photoUrl:
        "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/d7d6b38c-4abe-4f55-80c1-878528851579/M+NK+DF+24.7+IS+PANT+STRT+LEG.png",
    },
  ] satisfies StarterWish[],
}
