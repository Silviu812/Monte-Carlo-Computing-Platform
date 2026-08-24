import { useEffect, useState } from "react"
import { Link } from "react-router"

import { SectionCards } from "@/components/section-cards"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getJobResult, loadJobs, type Job } from "@/lib/jobs"

function getBadgeVariant(status: string) {
  if (status === "completed") return "default" as const
  if (status === "failed") return "destructive" as const
  if (status === "running" || status === "in_progress") {
    return "secondary" as const
  }
  return "outline" as const
}

export function DashboardLogged() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    loadJobs(controller.signal)
      .then(setJobs)
      .catch((error) => {
        if (error instanceof Error && error.name !== "AbortError") {
          setError(error.message)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [])

  const completedJobs = jobs.filter((job) => job.status === "completed")
  const runningJobs = jobs.filter((job) =>
    ["pending", "running", "in_progress"].includes(job.status)
  )
  const failedJobs = jobs.filter((job) => job.status === "failed")

  const bestJob = completedJobs.reduce<Job | null>((best, job) => {
    const result = getJobResult(job)
    if (!result) return best
    if (!best) return job

    const bestResult = getJobResult(best)
    return !bestResult || result.absolute_error < bestResult.absolute_error
      ? job
      : best
  }, null)

  const bestResult = bestJob ? getJobResult(bestJob) : null
  const recentJobs = [...jobs]
    .sort(
      (first, second) =>
        new Date(second.created_at).getTime() -
        new Date(first.created_at).getTime()
    )
    .slice(0, 4)

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>
  }

  if (error) {
    return <div className="p-8 text-destructive">{error}</div>
  }

  return (
    <main className="@container/main flex flex-1 flex-col gap-6 py-6">
      <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-muted-foreground">
            Monitor your Monte Carlo simulations and results.
          </p>
        </div>

        <Button render={<Link to="/jobs/create" />}>Create Job</Button>
      </div>

      <SectionCards
        total={jobs.length}
        completed={completedJobs.length}
        running={runningJobs.length}
        failed={failedJobs.length}
      />

      <div className="grid gap-4 px-4 lg:grid-cols-2 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Closest estimate to π</CardTitle>
            <CardDescription>
              Best result across completed simulations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bestJob && bestResult ? (
              <div className="space-y-4">
                <p className="text-4xl font-semibold tabular-nums">
                  {bestResult.estimated_pi.toFixed(8)}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Absolute error</p>
                    <p className="font-medium tabular-nums">
                      {bestResult.absolute_error.toExponential(3)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Points</p>
                    <p className="font-medium tabular-nums">
                      {bestResult.total_points.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Complete a job to see your best estimate.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Jobs</CardTitle>
              <CardDescription>Your latest simulations.</CardDescription>
            </div>
            <Button variant="outline" size="sm" render={<Link to="/jobs" />}>
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {recentJobs.length === 0 ? (
              <p className="text-muted-foreground">No jobs submitted yet.</p>
            ) : (
              <div className="divide-y">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">Job #{job.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.total_points?.toLocaleString() ?? "—"} points
                      </p>
                    </div>
                    <Badge variant={getBadgeVariant(job.status)}>
                      {job.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default DashboardLogged
