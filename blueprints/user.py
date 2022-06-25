import logging
from datetime import datetime
import logging
from flask import Blueprint, request
from werkzeug.datastructures import _omd_bucket

from models.user_model import UserModel, UserSchema
from models.family_model import FamilyModel
from models.shared import db

from utils import success_json_response
from security import secured, valid_user
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
    if not user:
      raise ObjectNotFoundException("User not found")
    return user_schema.jsonify(user)

@user.route("/", methods=["PATCH"])
@error_handler
@secured
@valid_user
def edit_user(username, groups, user_id):
  user = UserModel.query.filter(UserModel.username == username).first()
  if not user:
    raise ObjectNotFoundException("No user exists")
  if "first_name" in request.json:
    setattr(user, "first_name", request.json["first_name"])
  if "last_name" in request.json:
    setattr(user, "last_name", request.json["last_name"])
  db.session.commit()
  return user_schema.jsonify(user)

@user.route("/invite", methods=["POST"])
@error_handler
@secured
def invite_user(username, groups):
  """
  This method creates a user record ready for a new user to sign up so they can use a family group that has been shared with them
  """
  if not request.json:
    logger.info("Request is not JSON")
    raise BadRequestException("Request should be JSON")
  else:
    proposed_username = request.json["proposed_username"]
    user = UserModel.query.filter(UserModel.username == proposed_username).first()
    if user:
      logger.info("Trying to create user where a record already exists")
      raise BadRequestException("Cannot create a new user when the user exists already")
    else:
      new_user = UserModel(
        username = proposed_username,
        join_date = datetime.now(),
        enabled = True
      )
      db.session.add(new_user)
      db.session.commit()
      user = UserModel.query.get(new_user.id)
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

