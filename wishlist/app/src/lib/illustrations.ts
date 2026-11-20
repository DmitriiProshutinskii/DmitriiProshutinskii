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
  // Densitometry: a person lying on the scanner table under the scanning arm.
  scan: svg(
    `<path d="M100 88V34H58" fill="none" stroke="#9aa3b2" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<rect x="48" y="30" width="26" height="12" rx="3" fill="#6b7280"/>` +
      `<path d="M52 42H70L80 72H42Z" fill="#3b82f6" opacity=".22"/>` +
      `<circle cx="30" cy="66" r="8" fill="#e9b88f"/>` +
      `<rect x="40" y="60" width="54" height="14" rx="7" fill="#5b8def"/>` +
      `<rect x="14" y="74" width="92" height="8" rx="3" fill="#d4d8e0"/>` +
      `<path d="M24 82V98M96 82V98" stroke="#9aa3b2" stroke-width="5" stroke-linecap="round"/>` +
      `<rect x="40" y="70" width="42" height="3" rx="1.5" fill="#3b82f6"/>`
  ),
  // Body composition analyser (InBody): a platform with a column, hand grips and a screen.
  inbody: svg(
    `<rect x="30" y="92" width="60" height="12" rx="4" fill="#6b7280"/>` +
      `<path d="M42 92H78" stroke="#c9ced8" stroke-width="3" stroke-linecap="round"/>` +
      `<rect x="54" y="38" width="12" height="56" rx="3" fill="#9aa3b2"/>` +
      `<rect x="40" y="18" width="40" height="26" rx="4" fill="#3a3f47"/>` +
      `<rect x="44" y="22" width="32" height="18" rx="2" fill="#5b8def"/>` +
      `<path d="M48 35V30M54 35V27M60 35V32M66 35V25M72 35V29" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>` +
      `<path d="M38 50C30 50 26 56 26 62M82 50C90 50 94 56 94 62" fill="none" stroke="#3a3f47" stroke-width="4" stroke-linecap="round"/>` +
      `<rect x="20" y="60" width="12" height="16" rx="4" fill="#3a3f47"/><rect x="88" y="60" width="12" height="16" rx="4" fill="#3a3f47"/>`
  ),
  // Small crossbody bag with a strap and a zip.
  bag: svg(
    `<path d="M30 60C30 30 52 16 60 16C68 16 90 30 90 60" fill="none" stroke="#7a5c43" stroke-width="5" stroke-linecap="round"/>` +
      `<rect x="24" y="54" width="72" height="50" rx="12" fill="#3f4652"/>` +
      `<path d="M30 68H90" stroke="#c9ced8" stroke-width="2.5" stroke-linecap="round"/>` +
      `<rect x="80" y="64" width="6" height="11" rx="2" fill="#c9ced8"/>` +
      `<rect x="40" y="82" width="40" height="14" rx="4" fill="#4c5563"/>` +
      `<rect x="54" y="86" width="12" height="6" rx="2" fill="#7a5c43"/>`
  ),
  // Phone in a case hanging from a crossbody cord.
  lanyard: svg(
    `<path d="M22 14C30 44 44 60 56 66M98 14C90 44 76 60 64 66" fill="none" stroke="#c48a3a" stroke-width="4" stroke-linecap="round"/>` +
      `<rect x="40" y="58" width="40" height="56" rx="9" fill="#d6cfc4"/>` +
      `<rect x="44" y="62" width="32" height="48" rx="6" fill="#ece7df"/>` +
      `<rect x="47" y="65" width="16" height="16" rx="4" fill="#3a3f47"/>` +
      `<circle cx="52" cy="70" r="3" fill="#6b7280"/><circle cx="58" cy="76" r="3" fill="#6b7280"/><circle cx="52" cy="77" r="2" fill="#6b7280"/>` +
      `<circle cx="56" cy="64" r="3" fill="none" stroke="#c48a3a" stroke-width="2"/><circle cx="64" cy="64" r="3" fill="none" stroke="#c48a3a" stroke-width="2"/>`
  ),
  // Travel mug: a tapered tumbler with a lid and a wisp of steam.
  mug: svg(
    `<path d="M58 22C54 16 62 12 58 6M66 22C62 16 70 12 66 6" fill="none" stroke="#b9bfca" stroke-width="2.5" stroke-linecap="round"/>` +
      `<rect x="36" y="26" width="48" height="12" rx="4" fill="#3a3f47"/>` +
      `<rect x="56" y="22" width="16" height="6" rx="2" fill="#3a3f47"/>` +
      `<path d="M38 38H82L76 108C75.6 111 73 113 70 113H50C47 113 44.4 111 44 108Z" fill="#a9c5b4"/>` +
      `<path d="M41 60H79L78 72H42Z" fill="#8a5a36"/>` +
      `<rect x="52" y="82" width="16" height="10" rx="3" fill="#f6f1e8" opacity=".8"/>`
  ),
  // Massage gift certificate: a card with a ribbon and a stack of spa stones.
  certificate: svg(
    `<rect x="12" y="28" width="84" height="56" rx="7" fill="#f6ead9" stroke="#d9c2a3" stroke-width="2"/>` +
      `<rect x="34" y="28" width="9" height="56" fill="#d9534f"/><rect x="12" y="51" width="84" height="9" fill="#d9534f"/>` +
      `<path d="M38 55C30 44 22 48 26 54C29 58 34 57 38 55ZM39 55C47 44 55 48 51 54C48 58 43 57 39 55Z" fill="#b83b38"/>` +
      `<rect x="54" y="36" width="32" height="5" rx="2.5" fill="#c8ad8a"/><rect x="54" y="68" width="24" height="5" rx="2.5" fill="#c8ad8a"/>` +
      `<ellipse cx="88" cy="102" rx="22" ry="7" fill="#4b5563"/>` +
      `<ellipse cx="88" cy="91" rx="16" ry="6" fill="#6b7280"/>` +
      `<ellipse cx="88" cy="81" rx="10" ry="4.5" fill="#9ca3af"/>` +
      `<path d="M88 77C86 68 92 62 100 62C100 70 95 76 88 77Z" fill="#5fa86b"/>`
  ),
}
