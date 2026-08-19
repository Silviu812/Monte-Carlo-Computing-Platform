
import os

from flask import Flask, jsonify, request, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from authlib.integrations.flask_client import OAuth


app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = 'postgresql://postgres:test@localhost:5432/flask_oidc'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')

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

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sub = db.Column(db.String(120), unique=True, nullable=False)
    email = db.Column(db.String(120))
    name = db.Column(db.String(120), nullable=False)
    picture = db.Column(db.String(250), nullable=True)

    def __repr__(self):
        return f'<User {self.email}>'


@app.route('/')
def index():
    user = session.get('user')
    if user:
        return CHANGEME(frontend redirect)
    else:
        return CHANGEME(frontend redirect)

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


if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True)
