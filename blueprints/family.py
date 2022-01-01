import logging
from datetime import datetime
import logging
from flask import Blueprint, request
from flask.json import jsonify

from models.user_model import UserModel
from models.family_model import FamilyModel, FamilySchema
from models.user_to_family import UserToFamilyModel
from models.shared import db

from utils import success_json_response
from security import secured, valid_user
from error_handler import error_handler, BadRequestException

logger = logging.getLogger(__name__)

family = Blueprint('family', __name__)
family_schema = FamilySchema()
families_schema = FamilySchema(many=True)

@family.route("/", methods=["GET"])
@error_handler
@secured
@valid_user
def get_all_families(username, groups, user_id):
  # get all the families that I'm the primary owner of
  families = FamilyModel.query.filter(FamilyModel.primary_user_id == user_id).all()
  direct_result = families_schema.dump(families)
  families = FamilyModel.query.filter(FamilyModel.other_users.any(user_id=user_id)).all()
  return jsonify(direct_result)

@family.route("/<int:family_id>/other_users/<int:other_user_id>", methods=["PUT"])
@error_handler
@secured
@valid_user
def add_other_user(username, groups, user_id, family_id, other_user_id):
  # get the family, must be the owner to make these changes

@family.route("/", methods=["PUT"])
@error_handler
@secured
@valid_user
def create_family(username, groups, user_id):
  #user = UserModel.query.filter(UserModel.username == username).first()
  #if not user:
  #  raise BadRequestException("No user is registered")
  if not request.json:
    logger.info("Request is not JSON")
    raise BadRequestException("Request should be JSON")
  # if we get here we have a good request
  family_name = request.json["family_name"]
  new_family = FamilyModel(
    family_name = family_name,
    primary_user_id = user_id
  )
  db.session.add(new_family)
  db.session.commit()
  family = FamilyModel.query.get(new_family.id)
  return family_schema.jsonify(family)

