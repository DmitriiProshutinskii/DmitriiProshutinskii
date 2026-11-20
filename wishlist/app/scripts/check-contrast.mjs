// WCAG contrast check of every visible text element, in light and dark, owner and friend views,
// with a hostile host reset injected (unlayered body colours) to mimic embedding pages.
// Usage: node scripts/check-contrast.mjs [path-to-built-html]
import { createRequire } from "node:module"
import { pathToFileURL } from "node:url"
import { resolve } from "node:path"

// playwright is resolved via require so a globally installed copy (NODE_PATH) works too
const { chromium } = createRequire(import.meta.url)("playwright")

const file = pathToFileURL(resolve(process.argv[2] || "dist-artifact/index.html")).href
const HOSTILE = "body{margin:0;font:14px system-ui;color:#000;background:#fff}"

const audit = () => {
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })
  const rgba = (c) => {
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = "#000"
    ctx.fillStyle = c
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
    return [r, g, b, a / 255]
  }
  const over = (top, under) => top.slice(0, 3).map((v, i) => v * top[3] + under[i] * (1 - top[3])).concat(1)
  const lum = ([r, g, b]) => {
    const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
  }
  const bgOf = (el) => {
    const stack = []
    for (let n = el; n; n = n.parentElement) {
      const c = rgba(getComputedStyle(n).backgroundColor)
      if (c[3] > 0) stack.push(c)
      if (c[3] === 1) break
    }
    let base = [255, 255, 255, 1]
    for (const c of stack.reverse()) base = over(c, base)
    return base
  }
  const out = []
  for (const el of document.querySelectorAll("body *")) {
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
    if (!own) continue
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    if (!r.width || cs.visibility === "hidden" || +cs.opacity === 0 || el.closest(".sr-only,[aria-hidden=true]")) continue
    let op = 1
    for (let n = el; n; n = n.parentElement) op *= +getComputedStyle(n).opacity
    const bg = bgOf(el)
    const fg = over([...rgba(cs.color).slice(0, 3), rgba(cs.color)[3] * op], bg)
    const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x)
    const ratio = (a + 0.05) / (b + 0.05)
    const size = parseFloat(cs.fontSize)
    const large = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700)
    const need = large ? 3 : 4.5
    if (ratio < need) out.push(`${ratio.toFixed(2)} < ${need}  "${el.textContent.trim().slice(0, 40)}"`)
  }
  return out
}

const browser = await chromium.launch()
let failures = 0
for (const scheme of ["light", "dark"]) {
  for (const role of ["friend", "owner"]) {
    const page = await browser.newPage({ colorScheme: scheme, viewport: { width: 1000, height: 1400 } })
    await page.goto(`${file}#${role}`)
    await page.addStyleTag({ content: HOSTILE })
    await page.waitForTimeout(400)
    // main screen, then an open wish and an open theme (dialog content)
    const views = [
      ["page", null],
      ["wish", /Кофе Tasty Coffee/],
      ["theme", /Картинг и F1/],
    ]
    for (const [name, button] of views) {
      if (button) {
        await page.keyboard.press("Escape")
        await page.waitForTimeout(300)
        await page.getByRole("button", { name: button }).first().click()
        await page.waitForTimeout(500)
      }
      const bad = await page.evaluate(audit)
      failures += bad.length
      console.log(`${scheme}/${role}/${name}: ${bad.length ? bad.length + " problems" : "ok"}`)
      bad.forEach((l) => console.log("   " + l))
    }
    await page.close()
  }
}
await browser.close()
process.exit(failures ? 1 : 0)
