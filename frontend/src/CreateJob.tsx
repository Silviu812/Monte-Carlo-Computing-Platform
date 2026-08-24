import { useState } from "react"
import { useNavigate } from "react-router"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type CreateJobResponse = {
  job_id: number
}

export function CreateJob() {
  const navigate = useNavigate()

  const [seed, setSeed] = useState("")
  const [totalPoints, setTotalPoints] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const parsedSeed = Number(seed)
    const parsedTotalPoints = Number(totalPoints)

    if (!Number.isSafeInteger(parsedSeed) || parsedSeed < 0) {
      setError("Seed must be a non-negative integer.")
      return
    }

    if (
      !Number.isSafeInteger(parsedTotalPoints) ||
      parsedTotalPoints <= 0
    ) {
      setError("Total points must be a positive integer.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seed: parsedSeed,
          total_points: parsedTotalPoints,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create job.")
      }

      const createdJob = data as CreateJobResponse

      console.log("Created job:", createdJob.job_id)

      navigate("/jobs")
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle>Create a Job</CardTitle>
            <CardDescription>
              Configure a new Monte Carlo simulation.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="seed">Seed</Label>
                <Input
                  id="seed"
                  name="seed"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="42"
                  value={seed}
                  onChange={(event) => setSeed(event.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The seed makes the simulation reproducible.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="total-points">
                  Total Points
                </Label>
                <Input
                  id="total-points"
                  name="total_points"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="1000000"
                  value={totalPoints}
                  onChange={(event) =>
                    setTotalPoints(event.target.value)
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Number of random points used to estimate π.
                </p>
              </div>

              {error && (
                <p className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Start Computing"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </main>
  )
}

export default CreateJob