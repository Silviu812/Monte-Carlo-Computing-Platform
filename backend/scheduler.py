import time
from datetime import datetime

from extensions import db
from models import Job, JobTask, Result
from main import app




def define_jobs():
    freejobs = Job.query.filter_by(status='pending').all()
    if not freejobs:
        return
    batches_per_task = 10000
    for job in freejobs:
        job.status = 'in_progress'
        job.started_at = datetime.utcnow()
        total_points = job.total_points
        batch_size = 10000

        num_batches = (total_points + batch_size - 1) // batch_size
        num_tasks = (num_batches + batches_per_task - 1) // batches_per_task
        for task_index in range(num_tasks):
            start_batch = task_index * batches_per_task
            batch_count = min(
                batches_per_task,
                num_batches - start_batch
            )
        
            job_task = JobTask(
                job_id=job.id,
                start_batch=start_batch,
                batch_count=batch_count,
            )
            db.session.add(job_task)
    db.session.commit()


def completed_job(job_id):
    with app.app_context():
        job = Job.query.filter_by(id=job_id, status="in_progress").first()
        if job is None:
            return

        tasks = JobTask.query.filter_by(job_id=job_id).all()
        if not tasks or any(task.status != "completed" for task in tasks):
            return

        total_points_processed = sum(task.points_processed for task in tasks)
        total_points_in_circle = sum(task.points_in_circle for task in tasks)
        total_points_outside_circle = sum(task.points_outside_circle for task in tasks)

        estimated_pi = 4 * total_points_in_circle / total_points_processed
        absolute_error = abs(estimated_pi - 3.141592653589793)
        relative_error = absolute_error / 3.141592653589793

        probability_inside = total_points_in_circle / total_points_processed
        standard_error = 4 * (
            probability_inside * (1 - probability_inside) / total_points_processed
        ) ** 0.5

        job.completed_at = datetime.utcnow()
        time_taken = (job.completed_at - job.started_at).total_seconds()

        result = Result(
            job_id=job_id,
            total_points=total_points_processed,
            points_in_circle=total_points_in_circle,
            points_outside_circle=total_points_outside_circle,
            estimated_pi=estimated_pi,
            absolute_error=absolute_error,
            relative_error=relative_error,
            standard_error=standard_error,
            confidence_interval_lower=estimated_pi - 1.96 * standard_error,
            confidence_interval_upper=estimated_pi + 1.96 * standard_error,
            time_taken=time_taken,
            points_per_second=(
                total_points_processed / time_taken if time_taken > 0 else 0
            ),
        )

        job.status = "completed"
        db.session.add(result)
        db.session.commit()


if __name__ == "__main__":
    with app.app_context():
        while True:
            define_jobs()
            active_jobs = Job.query.filter_by(status="in_progress").all()
            for job in active_jobs:
                completed_job(job.id)
            time.sleep(5)
