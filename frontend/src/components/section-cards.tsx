import {
  BriefcaseBusiness,
  CircleCheck,
  Clock3,
  TriangleAlert,
} from "lucide-react"

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type SectionCardsProps = {
  total: number
  completed: number
  running: number
  failed: number
}

const cards = [
  {
    key: "total",
    label: "Total Jobs",
    description: "All submitted simulations",
    icon: BriefcaseBusiness,
  },
  {
    key: "completed",
    label: "Completed",
    description: "Results ready to inspect",
    icon: CircleCheck,
  },
  {
    key: "running",
    label: "Running",
    description: "Pending or processing",
    icon: Clock3,
  },
  {
    key: "failed",
    label: "Failed",
    description: "Jobs requiring attention",
    icon: TriangleAlert,
  },
] as const

export function SectionCards(props: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:px-6 @5xl/main:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <Card key={card.key} className="@container/card">
            <CardHeader>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {props[card.key].toLocaleString()}
              </CardTitle>
              <CardAction>
                <Icon className="size-5 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              {card.description}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
