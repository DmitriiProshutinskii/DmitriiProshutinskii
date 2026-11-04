// Turns the single-file build into a page body for a claude.ai Artifact (the host adds its own document skeleton).
import { readFileSync, writeFileSync } from "node:fs"
const src = readFileSync("dist-artifact/index.html", "utf8")
const out = src
  .replace(/<!doctype html>/i, "")
  .replace(/<\/?html[^>]*>/gi, "")
  .replace(/<\/?head>/gi, "")
  .replace(/<\/?body>/gi, "")
  .replace(/<meta name="viewport"[^>]*>/i, "")
  .replace(/<title>[^<]*<\/title>/, "<title>Вишлист Димы</title>")
writeFileSync("dist-artifact/wishlist.html", out.trim() + "\n")
console.log("dist-artifact/wishlist.html", (out.length / 1024).toFixed(0) + " KB")
