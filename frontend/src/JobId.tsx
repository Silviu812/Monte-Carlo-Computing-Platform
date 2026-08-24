import { useEffect, useState } from "react"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { Link, useParams } from "react-router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { fetchOneJob, getJobResult, type Job } from "@/lib/jobs"

function getBadgeVariant(status: string) {
  if (status === "completed") return "default" as const
  if (status === "failed") return "destructive" as const
  if (["pending", "running", "in_progress"].includes(status)) {
    return "secondary" as const
  }
  return "outline" as const
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—"
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium tabular-nums">{value}</p>
    </div>
  )
}

export function JobId() {
  const { jobId } = useParams()
  const parsedJobId = Number(jobId)
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isSafeInteger(parsedJobId) || parsedJobId <= 0) {
      setError("Invalid job ID.")
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    let timer: number | undefined

    async function refreshJob() {
      try {
        const nextJob = await fetchOneJob(parsedJobId, controller.signal)
        setJob(nextJob)
        setError(null)

        if (!["completed", "failed"].includes(nextJob.status)) {
          timer = window.setTimeout(refreshJob, 2_000)
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setError(error.message)
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    refreshJob()

    return () => {
      controller.abort()
      if (timer) window.clearTimeout(timer)
    }
  }, [parsedJobId])

  if (isLoading) {
    return <div className="p-8">Loading job...</div>
  }

  if (error || !job) {
    return (
      <main className="p-8">
        <p className="text-destructive">{error ?? "Job not found."}</p>
        <Button className="mt-4" variant="outline" render={<Link to="/jobs" />}>
          Back to jobs
        </Button>
      </main>
    )
  }

  const result = getJobResult(job)
  const isActive = ["pending", "running", "in_progress"].includes(job.status)

  return (
    <main className="flex-1 space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Button size="sm" variant="ghost" render={<Link to="/jobs" />}>
            <ArrowLeft />
            All Jobs
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Job #{job.id}</h1>
            <Badge variant={getBadgeVariant(job.status)}>{job.status}</Badge>
          </div>
          <p className="text-muted-foreground">
            Monte Carlo estimation created {formatDate(job.created_at)}.
          </p>
        </div>

        {isActive && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="size-4 animate-spin" />
            Updating automatically
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total points</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {job.total_points?.toLocaleString() ?? "—"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Seed</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{job.seed ?? "—"}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Estimated π</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {result ? result.estimated_pi.toFixed(10) : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Runtime</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {result ? `${result.time_taken.toFixed(2)} s` : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {job.error_message && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Job failed</CardTitle>
            <CardDescription>{job.error_message}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {isActive && !result && (
        <Card>
          <CardHeader>
            <CardTitle>Simulation in progress</CardTitle>
            <CardDescription>
              Workers are processing this job. Results will appear here when it completes.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {result && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Accuracy</CardTitle>
              <CardDescription>Difference from the reference value of π.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Metric label="Absolute error" value={result.absolute_error.toExponential(6)} />
              <Metric
                label="Relative error"
                value={`${(result.relative_error * 100).toFixed(6)}%`}
              />
              <Metric label="Standard error" value={result.standard_error.toExponential(6)} />
              <Metric
                label="95% confidence interval"
                value={`${result.confidence_interval_lower.toFixed(8)} – ${result.confidence_interval_upper.toFixed(8)}`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
              <CardDescription>Throughput and point classification.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Metric label="Points inside circle" value={result.points_in_circle.toLocaleString()} />
              <Metric label="Points outside circle" value={result.points_outside_circle.toLocaleString()} />
              <Metric
                label="Points per second"
                value={Math.round(result.points_per_second).toLocaleString()}
              />
              <Metric label="Points processed" value={result.total_points.toLocaleString()} />
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-3">
          <Metric label="Created" value={formatDate(job.created_at)} />
          <Metric label="Started" value={formatDate(job.started_at)} />
          <Metric label="Completed" value={formatDate(job.completed_at)} />
        </CardContent>
      </Card>
    </main>
  )
}

export default JobId
