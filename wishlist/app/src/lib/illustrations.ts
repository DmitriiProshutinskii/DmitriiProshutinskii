// Flat drawings (SVG markup) for wishes that have no product photo, such as services.

const svg = (body: string) => `<svg viewBox="0 0 120 120" aria-hidden="true" width="100%" height="100%">${body}</svg>`

const sparkle = (x: number, y: number, r: number, fill: string) =>
  `<path d="M${x} ${y - r}Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y}Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r}Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y}Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r}Z" fill="${fill}"/>`

export const illustrations: Record<string, string> = {
  beans: svg(
    `<path d="M38 32h44l6 68H32z" fill="#c9a274"/><rect x="38" y="24" width="44" height="10" rx="2" fill="#a77e52"/><rect x="44" y="52" width="32" height="30" rx="3" fill="#f6f1e8"/><ellipse cx="60" cy="67" rx="7" ry="10" fill="#5b3a24"/><path d="M60 58q-4 9 0 18" stroke="#f6f1e8" stroke-width="2" fill="none"/>`
  ),
  // Shoe cleaning: a sneaker in foam with a sparkle.
  shoes: svg(
    `<path d="M14 80C14 67 23 63 33 61L50 48C55 44 61 45 63 50L69 60C82 62 98 64 104 72C108 77 106 82 100 82H20C16 82 14 81 14 80Z" fill="#3a6fd6"/>` +
      `<path d="M50 52l8 9M45 56l8 9M40 60l8 8" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M13 80H107V85C107 88 105 90 102 90H18C15 90 13 88 13 85Z" fill="#f4f4f6" stroke="#cfd2da" stroke-width="2"/>` +
      `<circle cx="24" cy="96" r="6" fill="#d8e7ff" stroke="#9fbef0" stroke-width="2"/><circle cx="40" cy="99" r="4" fill="#d8e7ff" stroke="#9fbef0" stroke-width="2"/><circle cx="96" cy="97" r="5" fill="#d8e7ff" stroke="#9fbef0" stroke-width="2"/>` +
      sparkle(92, 40, 10, "#ffc23d") +
      sparkle(78, 26, 6, "#ffd77a")
  ),
  // Dry cleaning: a quilted jacket on a hanger.
  jacket: svg(
    `<path d="M60 22c0-5 4-7 7-7s6 3 6 6c0 4-4 5-7 7" fill="none" stroke="#8a8f99" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M28 40L60 28L92 40" fill="none" stroke="#8a8f99" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="M42 36L60 42L78 36L98 50L92 104H28L22 50Z" fill="#4c5b46"/>` +
      `<path d="M26 60H94M25 76H95M24 92H96" stroke="#5f704f" stroke-width="3"/>` +
      `<path d="M47 35Q60 50 73 35" fill="#3c4837"/><path d="M60 44V104" stroke="#d6d9c9" stroke-width="2"/>`
  ),
  // Vacuum coffee maker (siphon): two glass chambers on a stand over a burner.
  siphon: svg(
    `<path d="M88 22V108M76 108H100" stroke="#3a3f47" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M88 30H70M88 66H72" stroke="#3a3f47" stroke-width="4" stroke-linecap="round"/>` +
      `<path d="M40 18H70L66 48C65 52 62 54 58 54H52C48 54 45 52 44 48Z" fill="#e8f2fb" fill-opacity=".9" stroke="#8fa3b8" stroke-width="2.5"/>` +
      `<path d="M42 34H68L66 48C65 52 62 54 58 54H52C48 54 45 52 44 48Z" fill="#6b4226"/>` +
      `<rect x="53" y="52" width="4" height="18" fill="#c9d8e8" stroke="#8fa3b8" stroke-width="1.5"/>` +
      `<circle cx="55" cy="76" r="17" fill="#e8f2fb" fill-opacity=".9" stroke="#8fa3b8" stroke-width="2.5"/>` +
      `<path d="M39 80A17 17 0 0 0 71 80Z" fill="#8a5a36" fill-opacity=".55"/>` +
      `<rect x="45" y="103" width="20" height="8" rx="2" fill="#3a3f47"/>` +
      `<path d="M55 102C51 99 53 97 55 95C57 97 59 99 55 102Z" fill="#ff9d2e"/>`
  ),
  // Dental CT: a tooth under a scan line.
  tooth: svg(
    `<path d="M24 26V18H34M86 18H96V26M24 94V102H34M86 102H96V94" fill="none" stroke="#9aa3b2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="M38 36C38 25 48 21 60 27C72 21 82 25 82 36C82 48 78 56 76 68C74 80 72 94 66 94C61 94 62 74 60 74C58 74 59 94 54 94C48 94 46 80 44 68C42 56 38 48 38 36Z" fill="#ffffff" stroke="#9aa3b2" stroke-width="3" stroke-linejoin="round"/>` +
      `<rect x="20" y="55" width="80" height="4" rx="2" fill="#3b82f6" opacity=".85"/>`
  ),
}
