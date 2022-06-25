import logging
import os
from flask import Flask, request, redirect
from flask_cors import CORS
from sqlalchemy.exc import OperationalError, ProgrammingError

from utils import success_json_response
from security import secured
from error_handler import error_handler

from models.shared import db, ma
from models.user_model import UserModel

from create_tables import build_all_tables

app = Flask(__name__,
            static_url_path="/",
            static_folder="static")
CORS(app)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(basedir, "data.db")

db_user = os.environ.get("DB_USER")
db_password = os.environ.get("DB_PASSWORD")
db_host = os.environ.get("DB_HOST")
#app.config["SQLALCHEMY_DATABASE_URI"] = f"postgresql://{db_user}:{db_password}@{db_host}:5432/mealboard"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
ma.init_app(app)

from blueprints.user import user
from blueprints.family import family

# set logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] (%(threadName)-10s) %(message)s')
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
logger = logging.getLogger(__name__)

# manages route requests for content
@app.route("/")
def gotoindex():
  # headers on request
  logger.info("Headers on request...")
  for key,value in dict(request.headers).items():
    logger.debug("{key} -> {val}".format(key=key, val=value))
  # check for X-Forwarded headers
  if request.headers.get("x-forwarded-host"):
    host = request.headers.get("x-forwarded-host")
    # check if host is a list and get first element assuming this is the host the user expects
    if len(host.split(",")) > 1:
      host = host.split(",")[0].strip()
    if request.headers.get("x-forwarded-proto"):
      proto = request.headers.get("x-forwarded-proto")
      url = "{proto}://{host}/index.html".format(proto=proto, host=host)
      logger.info("URL for redirect is {url}".format(url=url))
      return redirect(url, code=302)
    else:
      url = "http://{host}/index.html".format(host=host)
      logger.info("URL for redirect is {url}".format(url=url))
      return redirect(url, code=302)
  else:
    return redirect("/index.html", code=302)

@app.route("/api/deploy")
@error_handler
def maketables():
  # check if DB has been initialised, and if not then do so
  try:
    user = UserModel.query.filter(UserModel.id == 1).first()
    return success_json_response({
      "status": "tables exist"
    })
  except OperationalError as err:
    logger.info("Got an error trying to query database")
    build_all_tables(db, app)
    return success_json_response({
      "status": "built tables"
    })
  except ProgrammingError as err:
    logger.info("Got an error trying to query database")
    build_all_tables(db, app)
    return success_json_response({
      "status": "built tables"
    })

@app.route("/api")
@error_handler
@secured
def root(username, groups):
  return success_json_response({
    "ping": "pong",
    "username": username,
    "groups": groups
  })

app.register_blueprint(user, url_prefix="/api/user")
app.register_blueprint(family, url_prefix="/api/family")

if __name__ == "__main__":
  app.run(debug=True, host="0.0.0.0", port=5000)