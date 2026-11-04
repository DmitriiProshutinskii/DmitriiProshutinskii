import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface Person {
  by: string
  text: string
  mine: boolean
}

export function PeopleList({ people, onRemove, removeLabel }: { people: Person[]; onRemove: (index: number) => void; removeLabel: string }) {
  if (!people.length) return null
  return (
    <ul className="grid gap-3">
      {people.map((p, i) => (
        <li key={i} className="grid grid-cols-[32px_1fr] items-start gap-3 text-sm">
          <Avatar>
            <AvatarFallback className="bg-th-soft text-th">{p.by.trim().charAt(0).toUpperCase() || "?"}</AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 gap-0.5">
            <span className="font-bold">{p.mine ? "Ты" : p.by}</span>
            {p.text && <span className="text-muted-foreground">{p.text}</span>}
            {p.mine && (
              <Button variant="link" size="sm" className="text-muted-foreground h-auto justify-self-start p-0" onClick={() => onRemove(i)}>
                {removeLabel}
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
