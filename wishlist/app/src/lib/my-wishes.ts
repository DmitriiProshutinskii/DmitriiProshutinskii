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
  /** Drawing from src/lib/illustrations.ts for wishes with no product photo (services). */
  illustration?: string
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
    {
      key: "games",
      name: "Игры",
      color: "blue",
      description: "Игры и всё вокруг них: подписки, аксессуары, мерч.",
    },
  ] satisfies StarterTheme[],
  wishes: [
    {
      key: "cockpit",
      title: "Кокпит Fanatec CSL Cockpit V1.5",
      url: "https://checkout.fanatec.com/products/csl-cockpit-v1-5",
      price: 33178,
      priority: 3,
      multi: false,
      themes: ["kart"],
      note: "Под мой руль Fanatec GT DD Pro, хочу в ближайшие дни. В Европе рама стоит €249,95, кресло — от €79,95 (без доставки). В России цен не нашёл, ориентир 30–45 тыс. ₽.",
      photoUrl: "https://cdn.shopify.com/s/files/1/0696/8423/2344/files/CRD-9010009-WW-04.png",
    },
    {
      key: "dental-ct",
      title: "КТ зубов перед лечением",
      url: "",
      price: 3000,
      priority: 3,
      multi: false,
      themes: [],
      note: "Нужна перед записью к стоматологу. Стоит около 3 000 ₽.",
      illustration: "tooth",
    },
    {
      key: "gta6",
      title: "GTA 6",
      url: "https://store.playstation.com/pl-pl/concept/10000730",
      price: 7678,
      priority: 2,
      multi: false,
      themes: ["games"],
      note: "Хочу в день релиза, 19 ноября. В PS Store и Xbox — 349 zł, издание Ultimate — 429 zł. Игра только для PS5 и Xbox, на ПК её нет.",
      photoUrl: "https://image.api.playstation.com/vulcan/ap/rnd/202606/1818/9f51f0ccdb65bd29c36a0907a738c2902a712f03e2fd6470.png?w=1024",
    },
    {
      key: "genutrain",
      title: "Наколенник Bauerfeind GenuTrain, 8-е поколение",
      url: "https://orteka.ru/product/ortez-bauerfeind-7901/?offer=720462",
      price: 15490,
      priority: 2,
      multi: false,
      themes: [],
      note: "Размер 4, стандартная ширина. В «Ортеке» можно оплатить «Сплитом»: 4 × 3 873 ₽.",
      photoUrl: "https://www.bauerfeind.us/media/db/05/f4/1759849210/shopping-genutrain_knee-brace-titan_1920x1920.jpg",
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
      key: "siphon",
      title: "Вакуумный кофейник (сифон) со стеклянной колбой",
      url: "https://market.yandex.ru/cc/BYFZz7",
      price: null,
      priority: 2,
      multi: false,
      themes: ["coffee"],
      note: "Подойдёт любой вакуумный кофейник со стеклянной колбой. По ссылке — вариант, который мне понравился.",
      illustration: "siphon",
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
    {
      key: "kcd2",
      title: "Kingdom Come: Deliverance II — Royal Edition",
      url: "",
      price: 8558,
      priority: 1,
      multi: false,
      themes: ["games"],
      note: "Самое полное издание: игра и все дополнения, 389 zł. Не срочно — после GTA 6. Часто бывает скидка 60%, тогда 155,60 zł (около 3 400 ₽).",
      photoUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1771300/library_600x900_2x.jpg",
    },
    {
      key: "protein",
      title: "Хороший протеин",
      url: "https://www.optimumnutrition.com/en-us/products/gold-standard-100-whey-protein-powder",
      price: 7000,
      priority: 1,
      multi: false,
      themes: [],
      note: "Например, Optimum Nutrition Gold Standard: ~900 г — около 7 000 ₽, 682 г — около 4 900 ₽ (Яндекс Маркет). Бренд и вкус ещё не выбрал, лучше уточнить у меня.",
      photoUrl: "https://cdn.shopify.com/s/files/1/0794/9991/9627/files/US_GSW_2LB_EXTMLKCHOC_FOP.png",
    },
    {
      key: "shoe-cleaning",
      title: "Химчистка обуви, 2 пары",
      url: "",
      price: 5000,
      priority: 1,
      multi: false,
      themes: [],
      note: "Не срочно. В Москве — от 1 490 ₽ за пару, экспресс около 2 500 ₽, комплексная 3 500–5 500 ₽. Всего выйдет от 3 000 до 11 000 ₽.",
      illustration: "shoes",
    },
    {
      key: "jacket-cleaning",
      title: "Химчистка пуховика и хлопковой куртки",
      url: "",
      price: 6500,
      priority: 1,
      multi: false,
      themes: [],
      note: "Не срочно. Пуховик 2 600–4 890 ₽, куртка без наполнителя около 4 290 ₽ (это цены дорогой сети, в других дешевле). Всего 5 500–9 200 ₽.",
      illustration: "jacket",
    },
  ] satisfies StarterWish[],
}
