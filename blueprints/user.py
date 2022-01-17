import logging
from datetime import datetime
import logging
from flask import Blueprint, request

from models.user_model import UserModel, UserSchema
from models.family_model import FamilyModel
from models.shared import db

from utils import success_json_response
from security import secured
from error_handler import ObjectNotFoundException, error_handler, BadRequestException

logger = logging.getLogger(__name__)

user = Blueprint('user', __name__)
user_schema = UserSchema()
users_schema = UserSchema(many=True)
other_user_schema = UserSchema(exclude=["enabled", "first_name", "last_name", "join_date"])

@user.route("/", methods=["GET"])
@error_handler
@secured
def get_user(username, groups):
  # need to check for the username filter
  username_filter = request.args.get("username")
  if username_filter:
    # we have a username_filter so use it
    user = UserModel.query.filter(UserModel.username == username_filter, UserModel.enabled == True).first()
    if not user:
      raise ObjectNotFoundException("User not found")
    return other_user_schema.jsonify(user)
  else:
    user = UserModel.query.filter(UserModel.username == username).first()
    return user_schema.jsonify(user)

@user.route("/", methods=["PUT"])
@error_handler
@secured
def create_user(username, groups):
  # check the user does not exist as if it does we need to respond with a 400
  user = UserModel.query.filter(UserModel.username == username).first()
  if user:
    logger.info("Trying to create user where a record already exists")
    raise BadRequestException("Cannot create a new user when the user exists already")
  else:
    logger.info("No user record exists yet")
    if not request.json:
      logger.info("Request is not JSON")
      raise BadRequestException("Request should be JSON")
    else:
      first_name = request.json["first_name"]
      last_name = request.json["last_name"]
      new_user = UserModel(
        username = username,
        first_name = first_name,
        last_name = last_name,
        join_date = datetime.now(),
        enabled = True
      )
      db.session.add(new_user)
      db.session.commit()
      user = UserModel.query.get(new_user.id)
      return user_schema.jsonify(user)

