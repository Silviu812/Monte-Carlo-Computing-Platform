export type JobResult = {
  total_points: number
  points_in_circle: number
  points_outside_circle: number
  estimated_pi: number
  absolute_error: number
  relative_error: number
  standard_error: number
  confidence_interval_lower: number
  confidence_interval_upper: number
  time_taken: number
  points_per_second: number
}

export type Job = {
  id: number
  status: string
  seed?: number
  total_points?: number
  created_at: string
  started_at: string | null
  completed_at: string | null
  error_message: string | null
  result: JobResult | string | null
}

type JobReference = {
  id: number
}

async function fetchJobs(signal?: AbortSignal): Promise<JobReference[]> {
  const response = await fetch("/api/jobs", { signal })

  if (!response.ok) {
    throw new Error("Failed to fetch jobs")
  }

  return response.json()
}

async function fetchOneJob(
  jobId: number,
  signal?: AbortSignal
): Promise<Job> {
  const response = await fetch(`/api/jobs/${jobId}`, { signal })

  if (!response.ok) {
    throw new Error(`Failed to fetch job ${jobId}`)
  }

  return response.json()
}

export async function loadJobs(signal?: AbortSignal): Promise<Job[]> {
  const jobReferences = await fetchJobs(signal)

  return Promise.all(
    jobReferences.map((job) => fetchOneJob(job.id, signal))
  )
}

export function getJobResult(job: Job): JobResult | null {
  return typeof job.result === "object" && job.result !== null
    ? job.result
    : null
}
