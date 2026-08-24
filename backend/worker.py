import time
import numpy as np
from main import app
from extensions import db
from models import JobTask, Job
import os
from datetime import datetime

def compute_batch(job_seed, batch_index, total_points):
    seed_sequence = np.random.SeedSequence([job_seed, batch_index])
    rng = np.random.default_rng(seed_sequence)
        
    x = rng.random(total_points)
    y = rng.random(total_points)
        
    inside = np.count_nonzero(x*x + y*y <= 1)
    return int(inside)

def compute_task(task):
    start_time = time.perf_counter()
    total_inside = 0
    processed_points = 0

    for offset in range(task["batch_count"]):
        points_in_batch = min(
            10_000,
            task["total_points"] - processed_points,
        )

        inside = compute_batch(
            job_seed=task["job_seed"],
            batch_index=task["start_batch"] + offset,
            total_points=points_in_batch,
        )

        total_inside += inside
        processed_points += points_in_batch

    return {
        "task_id": task["task_id"],
        "points_processed": processed_points,
        "points_in_circle": total_inside,
        "points_outside_circle": processed_points - total_inside,
        "time_taken": time.perf_counter() - start_time,
    }

def claim_task():
    with app.app_context():
        with db.session.begin():
            task = (
                JobTask.query
                .filter_by(status="pending")
                .order_by(JobTask.id)
                .with_for_update(skip_locked=True)
                .first()
            )

            if task is None:
                return None

            task.status = "running"
            task.worker_id = os.environ.get("HOSTNAME", str(os.getpid()))
            task.started_at = datetime.utcnow()

            job = db.session.get(Job, task.job_id)

            task_points = min(
                task.batch_count * 10_000,
                job.total_points - task.start_batch * 10_000,
            )

            return {
                "task_id": task.id,
                "job_id": job.id,
                "job_seed": job.seed,
                "start_batch": task.start_batch,
                "batch_count": task.batch_count,
                "total_points": task_points,
            }

def run_worker():
    while True:
        task = claim_task()
        if task is None:
            time.sleep(2)
            continue

        try:
            result = compute_task(task)
            with app.app_context():
                task_record = db.session.get(JobTask, task["task_id"])
                task_record.status = "completed"
                task_record.points_processed = result["points_processed"]
                task_record.points_in_circle = result["points_in_circle"]
                task_record.points_outside_circle = result["points_outside_circle"]
                task_record.time_taken = result["time_taken"]
                task_record.completed_at = datetime.utcnow()
                db.session.commit()
        except Exception as e:
            with app.app_context():
                task_record = db.session.get(JobTask, task["task_id"])
                task_record.status = "failed"
                task_record.error_message = str(e)
                db.session.commit()
if __name__ == "__main__":
    run_worker()