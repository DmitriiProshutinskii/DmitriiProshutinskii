// Shop photos for the clickable preview. They are kept out of git (see .gitignore: they belong to the shops);
// without them the preview falls back to the drawings in illustrations.ts.
const files = import.meta.glob<string>("../assets/demo-photos/*.webp", { eager: true, query: "?url", import: "default" })

export const demoPhoto = (name: string): string | null => files[`../assets/demo-photos/${name}.webp`] ?? null
