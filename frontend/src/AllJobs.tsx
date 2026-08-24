import { useEffect, useState } from "react"

import { getJobResult, loadJobs, type Job } from "@/lib/jobs"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function getBadgeVariant(status: string) {
  switch (status) {
    case "completed":
      return "default" as const
    case "failed":
      return "destructive" as const
    case "running":
    case "in_progress":
      return "secondary" as const
    default:
      return "outline" as const
  }
}

export function AllJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadJobsData() {
      try {
        const data = await loadJobs(controller.signal)
        setJobs(data)
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setError(error.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadJobsData()

    return () => controller.abort()
  }, [])

  if (isLoading) {
    return <div className="p-8">Loading jobs...</div>
  }

  if (error) {
    return <div className="p-8 text-destructive">{error}</div>
  }

  return (
    <main className="flex-1 p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">All Jobs</h1>
        <p className="text-muted-foreground">
          View your Monte Carlo simulations and their results.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Seed</TableHead>
              <TableHead>Estimated π</TableHead>
              <TableHead>Error</TableHead>
              <TableHead>Runtime</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No jobs found.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => {
                const result = getJobResult(job)

                return (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">#{job.id}</TableCell>

                    <TableCell>
                      <Badge variant={getBadgeVariant(job.status)}>
                        {job.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {job.total_points?.toLocaleString() ?? "—"}
                    </TableCell>

                    <TableCell>{job.seed ?? "—"}</TableCell>

                    <TableCell>
                      {result ? result.estimated_pi.toFixed(8) : "—"}
                    </TableCell>

                    <TableCell>
                      {result ? result.absolute_error.toExponential(3) : "—"}
                    </TableCell>

                    <TableCell>
                      {result ? `${result.time_taken.toFixed(2)} s` : "—"}
                    </TableCell>

                    <TableCell>
                      {new Date(job.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}

export default AllJobs
