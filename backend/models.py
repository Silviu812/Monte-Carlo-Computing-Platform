from datetime import datetime
from extensions import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sub = db.Column(db.String(120), unique=True, nullable=False)
    email = db.Column(db.String(120))
    name = db.Column(db.String(120), nullable=False)
    picture = db.Column(db.String(250), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<User {self.email}>"


class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False,
    )

    total_points = db.Column(db.BigInteger, nullable=False)
    seed = db.Column(db.BigInteger, default=0)

    status = db.Column(db.String(20), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    error_message = db.Column(db.String(500), nullable=True)


class Result(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(
        db.Integer,
        db.ForeignKey("job.id"),
        unique=True,
        nullable=False,
    )

    total_points = db.Column(db.BigInteger, nullable=False)
    points_in_circle = db.Column(db.BigInteger, nullable=False)
    points_outside_circle = db.Column(db.BigInteger, nullable=False)

    estimated_pi = db.Column(db.Float, nullable=False)
    absolute_error = db.Column(db.Float, nullable=False)
    relative_error = db.Column(db.Float, nullable=False)

    standard_error = db.Column(db.Float, nullable=False)
    confidence_interval_lower = db.Column(db.Float, nullable=False)
    confidence_interval_upper = db.Column(db.Float, nullable=False)

    time_taken = db.Column(db.Float, nullable=False)
    points_per_second = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)



class JobTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(
        db.Integer,
        db.ForeignKey("job.id"),
        nullable=False,
    )
    start_batch = db.Column(db.BigInteger, nullable=False)
    batch_count = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default="pending")
    worker_id = db.Column(db.String(120), nullable=True)

    points_processed = db.Column(db.BigInteger, nullable=True)
    points_in_circle = db.Column(db.BigInteger, nullable=True)
    points_outside_circle = db.Column(db.BigInteger, nullable=True)
    time_taken = db.Column(db.Float, nullable=True)

    error_message = db.Column(db.String(500), nullable=True)
    started_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)