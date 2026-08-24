
from flask import Flask, jsonify, request, redirect, url_for, session
from authlib.integrations.flask_client import OAuth
import os
from extensions import db
from models import User, Job, Result

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = (
    "postgresql://postgres:test@localhost:5432/flask_oidc"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")

db.init_app(app)

oauth = OAuth(app)
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
CONF_URL = 'https://accounts.google.com/.well-known/openid-configuration'
oauth.register(
        name='google',
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        server_metadata_url=CONF_URL,
        client_kwargs={
            'scope': 'openid email profile'
        }
    )

@app.route("/")
def index():
    return redirect("http://localhost:5173")

@app.route('/login')
def login():
    redirect_uri = url_for('authorize', _external=True)
    return oauth.google.authorize_redirect(redirect_uri)

@app.route("/authorize")
def authorize():
    token = oauth.google.authorize_access_token()
    session["user"] = token["userinfo"]
    if not User.query.filter_by(sub=token["userinfo"]["sub"]).first():
        user = User(
            sub=token["userinfo"]["sub"],
            email=token["userinfo"]["email"],
            name=token["userinfo"]["name"],
            picture=token["userinfo"]["picture"]
        )
        db.session.add(user)
        db.session.commit()
    return redirect("/")

@app.route("/logout")
def logout():
    if "user" in session:
        session.pop("user", None)
    return redirect("/")

@app.route('/api/me')
def me():
    user = session.get('user')
    if user:
        return jsonify({
            "name": user["name"],
            "picture": user["picture"]
        })
    else:
        return jsonify({"error": "Unauthorized"}), 401

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    user = session.get('user')
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    user_record = User.query.filter_by(sub=user["sub"]).first()
    if not user_record:
        return jsonify({"error": "User not found"}), 404
    jobs = Job.query.filter_by(user_id=user_record.id).all()
    jobs_list = [{"id": job.id} for job in jobs]
    return jsonify(jobs_list)

@app.route('/api/jobs', methods=['POST'])
def create_job():
    user = session.get('user')
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    user_record = User.query.filter_by(sub=user["sub"]).first()
    if not user_record:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()

    job = Job(
        user_id=user_record.id,
        seed=data['seed'],
        total_points=data['total_points'],
        status='pending'
    )
    db.session.add(job)
    db.session.commit()
    return jsonify({"job_id": job.id}), 201

@app.route('/api/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    user = session.get('user')
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    user_record = User.query.filter_by(sub=user["sub"]).first()
    if not user_record:
        return jsonify({"error": "User not found"}), 404

    job = Job.query.filter_by(id=job_id, user_id=user_record.id).first()
    if not job:
        return jsonify({"error": "Job not found"}), 404

    result = Result.query.filter_by(job_id=job.id).first()
    if result:
        job_data = {
            "id": job.id,
            "status": job.status,
            "created_at": job.created_at,
            "started_at": job.started_at,
            "completed_at": job.completed_at,
            "error_message": job.error_message,
            "seed": job.seed,
            "total_points": job.total_points,
            "result": {
                "total_points": result.total_points,
                "points_in_circle": result.points_in_circle,
                "points_outside_circle": result.points_outside_circle,
                "estimated_pi": result.estimated_pi,
                "absolute_error": result.absolute_error,
                "relative_error": result.relative_error,
                "standard_error": result.standard_error,
                "confidence_interval_lower": result.confidence_interval_lower,
                "confidence_interval_upper": result.confidence_interval_upper,
                "time_taken": result.time_taken,
                "points_per_second": result.points_per_second,
            }
        }
    else:
        job_data = {
            "id": job.id,
            "status": job.status,
            "created_at": job.created_at,
            "started_at": job.started_at,
            "completed_at": job.completed_at,
            "error_message": job.error_message,
            "result": "Pending or not yet available"
        }
    return jsonify(job_data)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True)
