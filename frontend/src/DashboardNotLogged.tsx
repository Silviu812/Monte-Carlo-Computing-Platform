import { ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function DashboardNotLogged() {
  const featureName = "Monte Carlo Computing Platform"

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6">
        <Card
      size="default"
      className="w-full max-w-2xl [--card-spacing:--spacing(6)]"
    >
      <CardHeader>
        <CardTitle className="text-xl">{featureName}</CardTitle>
      </CardHeader>
      <CardDescription className="px-6 text-base text-muted-foreground">
        You need to be logged in to access all features.
      </CardDescription>
      <CardContent>
        <ul className="grid gap-3 py-3 text-base">
          <li className="flex gap-2">
            <ChevronRightIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <span>Run reproducible simulations with custom sample counts and seeds.</span>
          </li>
          <li className="flex gap-2">
            <ChevronRightIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <span>Visualize convergence toward π with error and confidence metrics.</span>
          </li>
          <li className="flex gap-2">
            <ChevronRightIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <span>Compare execution times across worker configurations.</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
        className="h-11 w-full"
        onClick={() => {
            window.location.href = "/login"
        }}
        >
        <img src="/googlesvg.svg" alt="" className="size-5" />
        <span>Sign in with Google</span>
        </Button>
      </CardFooter>
    </Card>
    </div>
  )
}
