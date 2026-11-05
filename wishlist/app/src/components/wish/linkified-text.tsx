import { Fragment } from "react"

const URL_RE = /(https?:\/\/[^\s<>"]+[^\s<>".,;:!?)»])/g

/** Plain text with http(s) links made clickable; shows the link without the protocol. */
export function LinkifiedText({ text }: { text: string }) {
  return (
    <>
      {text.split(URL_RE).map((part, i) =>
        i % 2 === 1 ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="font-semibold break-all underline underline-offset-2">
            {part.replace(/^https?:\/\/(www\.)?/, "")}
          </a>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  )
}
