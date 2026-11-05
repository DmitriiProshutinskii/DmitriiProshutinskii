// Flat placeholder drawings (SVG markup) standing in for product photos in the mockup.

const keyRects = (() => {
  let s = ""
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 11; c++) {
      if (r === 3 && c > 2 && c < 8) continue
      const accent = (r === 0 && c === 0) || (r === 3 && c === 10)
      s += `<rect x="${13 + c * 9}" y="${45 + r * 10}" width="7" height="8" rx="1.5" fill="${accent ? "#f08a3c" : "#e9e7e2"}"/>`
    }
  return s + `<rect x="40" y="75" width="43" height="8" rx="1.5" fill="#e9e7e2"/>`
})()

const flagRects = (x0: number, y0: number, cols: number, rows: number, size: number) => {
  let s = ""
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      s += `<rect x="${x0 + c * size}" y="${y0 + r * size}" width="${size}" height="${size}" fill="${(r + c) % 2 ? "#ffffff" : "#1b1b1f"}"/>`
  return s
}

const svg = (body: string) => `<svg viewBox="0 0 120 120" aria-hidden="true" width="100%" height="100%">${body}</svg>`

const carBody = (c: string) =>
  `<path d="M10 78 L28 71 L50 69 L58 60 L72 59 L79 69 L100 70 L104 60 L114 60 L114 79 L10 81 Z" fill="${c}"/><rect x="102" y="56" width="13" height="5" rx="1" fill="#1f1f22"/><rect x="6" y="74" width="10" height="4" rx="1" fill="#1f1f22"/><circle cx="65" cy="62" r="4.5" fill="#f4f4f4"/><circle cx="30" cy="81" r="11" fill="#1f1f22"/><circle cx="30" cy="81" r="4" fill="#8a8a90"/><circle cx="95" cy="81" r="12" fill="#1f1f22"/><circle cx="95" cy="81" r="4.5" fill="#8a8a90"/>`

export const illustrations: Record<string, string> = {
  headphones: svg(
    `<path d="M28 70V56a32 32 0 0 1 64 0v14" fill="none" stroke="#3a3e48" stroke-width="7" stroke-linecap="round"/><rect x="17" y="60" width="24" height="38" rx="11" fill="#262931"/><rect x="79" y="60" width="24" height="38" rx="11" fill="#262931"/><rect x="24" y="67" width="10" height="24" rx="5" fill="#4b505d"/><rect x="86" y="67" width="10" height="24" rx="5" fill="#4b505d"/>`
  ),
  grinder: svg(
    `<path d="M60 36V24h26" fill="none" stroke="#2d2f33" stroke-width="4" stroke-linecap="round"/><circle cx="88" cy="24" r="7" fill="#9b6a47"/><rect x="42" y="34" width="36" height="10" rx="3" fill="#2d2f33"/><rect x="44" y="44" width="32" height="54" rx="5" fill="#a9afb6"/><rect x="44" y="68" width="32" height="3" fill="#878d95"/><rect x="44" y="90" width="32" height="8" rx="3" fill="#2d2f33"/>`
  ),
  keyboard: svg(`<rect x="8" y="40" width="104" height="48" rx="8" fill="#30333b"/>${keyRects}`),
  book: svg(
    `<rect x="34" y="20" width="54" height="80" rx="3" fill="#e9b949"/><rect x="34" y="20" width="8" height="80" fill="#c8962a"/><rect x="50" y="34" width="30" height="5" rx="2" fill="#26262a"/><rect x="50" y="44" width="22" height="4" rx="2" fill="#26262a" opacity=".55"/><path d="M53 80h22l-3 8H56z M57 72a7 7 0 0 1 14 0v8H57z" fill="none" stroke="#26262a" stroke-width="2.5" stroke-linejoin="round"/>`
  ),
  ticket: svg(
    `<rect x="12" y="34" width="96" height="54" rx="9" fill="#ffffff" stroke="#d6d6dc"/>${flagRects(21, 43, 4, 6, 6)}<line x1="52" y1="40" x2="52" y2="82" stroke="#d6d6dc" stroke-dasharray="3 3"/><text x="58" y="60" textLength="42" lengthAdjust="spacingAndGlyphs" font-family="Geist Variable, Geist, sans-serif" font-weight="700" font-size="8.5" fill="#d7322a">КАРТИНГ</text><text x="58" y="73" textLength="42" lengthAdjust="spacingAndGlyphs" font-family="Geist Variable, Geist, sans-serif" font-weight="700" font-size="7" fill="#55555c">заезд на двоих</text>`
  ),
  tumbler: svg(
    `<path d="M40 30h40l-5 70a6 6 0 0 1-6 5H51a6 6 0 0 1-6-5z" fill="#5e8f78"/><rect x="37" y="22" width="46" height="10" rx="4" fill="#2f3a35"/><path d="M80 46h7a7 7 0 0 1 7 7v16a7 7 0 0 1-7 7h-9" fill="none" stroke="#4d7a65" stroke-width="6" stroke-linecap="round"/><rect x="46" y="40" width="5" height="50" rx="2.5" fill="#ffffff" opacity=".25"/>`
  ),
  lego: svg(carBody("#ff8a1f")),
  models: svg(
    `<g transform="translate(-2 -14) scale(.62)">${carBody("#d7322a")}</g><g transform="translate(44 34) scale(.62)">${carBody("#1f6fd1")}</g><g transform="translate(6 56) scale(.62)">${carBody("#1d9e6a")}</g>`
  ),
  beans: svg(
    `<path d="M38 32h44l6 68H32z" fill="#c9a274"/><rect x="38" y="24" width="44" height="10" rx="2" fill="#a77e52"/><rect x="44" y="52" width="32" height="30" rx="3" fill="#f6f1e8"/><ellipse cx="60" cy="67" rx="7" ry="10" fill="#5b3a24"/><path d="M60 58q-4 9 0 18" stroke="#f6f1e8" stroke-width="2" fill="none"/>`
  ),
}
