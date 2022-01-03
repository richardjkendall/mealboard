import logging
from datetime import datetime
import logging
from sqlalchemy import or_, and_
from flask import Blueprint, request
from flask.json import jsonify
from werkzeug.datastructures import _omd_bucket

from models.family_model import FamilyModel, FamilySchema
from models.user_to_family import UserToFamilyModel, UserToFamilySchema, UserRoleEnum
from models.user_model import UserModel
from models.board_model import BoardModel, BoardSchema, BoardScopeEnum
from models.shared import db

from utils import must_be_json
from security import secured, valid_user, user_can_edit_family, user_can_read_family
from error_handler import error_handler, BadRequestException, ObjectNotFoundException

logger = logging.getLogger(__name__)

family = Blueprint('family', __name__)
family_schema = FamilySchema()
families_schema = FamilySchema(many=True)
user_to_family_schema = UserToFamilySchema()
board_schema = BoardSchema()
boards_schema = BoardSchema(many=True)

@family.route("/", methods=["GET"])
@error_handler
@secured
@valid_user
def get_all_families(username, groups, user_id):
  # get all the families that I'm the primary owner of
  families = FamilyModel.query.filter(FamilyModel.primary_user_id == user_id).all()
  result = families_schema.dump(families)
  # get the families that I'm the indirect owner of
  indirect_families = UserModel.query.get(user_id).families
  result = result + families_schema.dump(indirect_families)
  return jsonify(result)

@family.route("/<int:family_id>", methods=["GET"])
@error_handler
@secured
@valid_user
@user_can_read_family
def get_family(username, groupds, user_id, family_id):
  family = FamilyModel.query.get_or_404(family_id)
  return family_schema.jsonify(family)

@family.route("/<int:family_id>/other_users/<int:other_user_id>", methods=["DELETE"])
@error_handler
@secured
@valid_user
@user_can_edit_family
def delete_other_user(username, groups, user_id, family_id, other_user_id):
  pass

@family.route("/<int:family_id>/other_users/<int:other_user_id>", methods=["PUT", "PATCH"])
@error_handler
@secured
@valid_user
@user_can_edit_family
@must_be_json
def add_other_user(username, groups, user_id, family_id, other_user_id):
  # get the family, must be the owner to make these changes
  family = FamilyModel.query.get_or_404(family_id)
  if not family.primary_user_id == user_id:
    raise ObjectNotFoundException("Could not find this family")
  # check if association already exists
  user2family = UserToFamilyModel.query.filter(UserToFamilyModel.family_id == family_id, UserToFamilyModel.user_id == other_user_id).first()
  # need to check if role is valid
  role = request.json.get("role")
  if not role:
    raise BadRequestException("No role specified in request")
  if not user2family:
    new_user2family = UserToFamilyModel(
      family_id = family_id,
      user_id = other_user_id,
      role = UserRoleEnum(role).name
    )
    db.session.add(new_user2family)
    db.session.commit()
    user2family = UserToFamilyModel.query.get(new_user2family.id)
    return user_to_family_schema.jsonify(user2family)
  else:
    user2family.role = UserRoleEnum(role).name
    db.session.commit()
    return user_to_family_schema.jsonify(user2family)

@family.route("/", methods=["PUT"])
@error_handler
@secured
@valid_user
@must_be_json
def create_family(username, groups, user_id):
  family_name = request.json["family_name"]
  new_family = FamilyModel(
    family_name = family_name,
    primary_user_id = user_id
  )
  db.session.add(new_family)
  db.session.commit()
  family = FamilyModel.query.get(new_family.id)
  return family_schema.jsonify(family)

@family.route("/<int:family_id>/board", methods=["GET"])
@error_handler
@secured
@valid_user
@user_can_read_family
def get_boards(username, groups, user_id, family_id):
  # get all the boards for this family that this user can see
  boards = BoardModel.query.filter(BoardModel.family_id == family_id, 
    or_(and_(BoardModel.scope == BoardScopeEnum.PRIVATE, BoardModel.owning_user_id == user_id),
             BoardModel.scope == BoardScopeEnum.FAMILY,
             BoardModel.scope == BoardScopeEnum.PUBLIC))
  result = boards_schema.dump(boards)
  return jsonify(result)

@family.route("/<int:family_id>/board/<int:board_id>", methods=["GET"])
@error_handler
@secured
@valid_user
@user_can_read_family
def get_board(username, groups, user_id, family_id, board_id):
  # get the board
  board = BoardModel.query.filter(BoardModel.id == board_id, BoardModel.family_id == family_id).first()
  if not board:
    raise ObjectNotFoundException("No such board is found")
  # check the board can be seen by this user
  if (board.owning_user_id == user_id and board.scope == BoardScopeEnum.PRIVATE) or (board.family_id == family_id and (board.scope == BoardScopeEnum.FAMILY or board.scope == BoardScopeEnum.PUBLIC)):
    return board_schema.jsonify(board)
  else:
    raise ObjectNotFoundException("No such board is found")

@family.route("/<int:family_id>/board/<int:board_id>", methods=["PATCH"])
@error_handler
@secured
@valid_user
@user_can_edit_family
@must_be_json
def edit_board(username, groups, user_id, family_id, board_id):
  # get the board
  board = BoardModel.query.filter(BoardModel.id == board_id, BoardModel.family_id == family_id).first()
  if not board:
    raise ObjectNotFoundException("No such board is found")
  # check the board can be edited by this user
  if (board.owning_user_id == user_id and board.scope == BoardScopeEnum.PRIVATE) or (board.family_id == family_id and (board.scope == BoardScopeEnum.FAMILY or board.scope == BoardScopeEnum.PUBLIC)):
    editable_fields = ["board_name", "scope"]
    for field in editable_fields:
      if request.json.get(field):
        if field == "scope":
          setattr(board, field, BoardScopeEnum(request.json[field]).name)
        else:
          setattr(board, field, request.json[field])
    db.session.commit()
    return board_schema.jsonify(board)
  else:
    raise ObjectNotFoundException("No such board is found")

@family.route("/<int:family_id>/board", methods=["PUT"])
@error_handler
@secured
@valid_user
@user_can_edit_family
@must_be_json
def create_board(username, groups, user_id, family_id):
  board_name = request.json["board_name"]
  scope = request.json["scope"]
  new_board = BoardModel(
    board_name = board_name,
    scope = BoardScopeEnum(scope).name,
    owning_user_id = user_id,
    family_id = family_id
  )
  db.session.add(new_board)
  db.session.commit()
  board = BoardModel.query.get(new_board.id)
  return board_schema.jsonify(board)



