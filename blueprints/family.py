import logging
from sqlalchemy import or_, and_
from flask import Blueprint, request
from flask.json import jsonify
import dateutil.parser

from models.family_model import FamilyModel, FamilySchema
from models.user_to_family import UserToFamilyModel, UserToFamilySchema, UserRoleEnum
from models.user_model import UserModel, UserSchema
from models.board_model import BoardModel, BoardSchema, BoardScopeEnum
from models.week_model import WeekModel, WeekSchema
from models.meal_model import MealModel, MealSchema
from models.ingredient_model import IngredientModel
from models.week_to_meal import WeekToMealModel, WeekToMealSchema
from models.shared import db

from utils import must_be_json, success_json_response
from security import secured, valid_user, user_can_edit_family, user_can_read_family, user_can_see_board
from error_handler import AccessDeniedException, error_handler, BadRequestException, ObjectNotFoundException

logger = logging.getLogger(__name__)

family = Blueprint('family', __name__)
family_schema = FamilySchema(exclude=["boards.weeks", "meals.ingredients"])
families_schema = FamilySchema(many=True, exclude=["boards.weeks", "meals.ingredients"])
user_to_family_schema = UserToFamilySchema()
users_schema = UserSchema(many=True)
board_schema = BoardSchema(exclude=["weeks.meals"])
boards_schema = BoardSchema(many=True, exclude=["weeks.meals"])
week_schema = WeekSchema(exclude=["meals.meal.ingredients"])
weeks_schema = WeekSchema(many=True, exclude=["meals.meal.ingredients"])
meal_schema = MealSchema()
meals_schema = MealSchema(many=True, exclude=["ingredients"])
week_to_meal_schema = WeekToMealSchema()
week_to_meals_schema = WeekToMealSchema(many=True, exclude=["meal.ingredients"])

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

@family.route("/<int:family_id>/meal", methods=["GET"])
@error_handler
@secured
@valid_user
@user_can_read_family
def get_meals(username, groups, user_id, family_id):
  family = FamilyModel.query.get_or_404(family_id)
  return jsonify(meals_schema.dump(family.meals))

@family.route("/<int:family_id>/meal/<int:meal_id>", methods=["GET"])
@error_handler
@secured
@valid_user
@user_can_read_family
def get_meal(username, groups, user_id, family_id, meal_id):
  meal = MealModel.query.filter(MealModel.family_id == family_id, MealModel.id == meal_id).first()
  if not meal:
    raise ObjectNotFoundException("Meal not found")
  return meal_schema.jsonify(meal)

@family.route("/<int:family_id>/meal/<int:meal_id>", methods=["DELETE"])
@error_handler
@secured
@valid_user
@user_can_edit_family
def delete_meal(username, groups, user_id, family_id, meal_id):
  meal = MealModel.query.filter(MealModel.family_id == family_id, MealModel.id == meal_id).first()
  if not meal:
    raise ObjectNotFoundException("Meal not found")
  db.session.delete(meal)
  db.session.commit()
  return success_json_response({
    "id": meal_id,
    "status": "deleted"
  })

@family.route("/<int:family_id>/meal", methods=["PUT"])
@error_handler
@secured
@valid_user
@user_can_edit_family
@must_be_json
def create_meal(username, groups, user_id, family_id):
  family = FamilyModel.query.get_or_404(family_id)
  if not "meal_name" in request.json:
    raise BadRequestException("Please provide meal name")
  new_meal = MealModel(
    meal_name = request.json["meal_name"],
    family_id = family.id
  )
  if "portions" in request.json:
    setattr(new_meal, "portions", request.json["portions"])
  if "ingredients" in request.json:
    for ingredient in request.json["ingredients"]:
      new_ingredient = IngredientModel(
        ingredient_name = ingredient["ingredient_name"],
        quantity = ingredient["quantity"],
        unit = ingredient["unit"]
      )
      new_meal.ingredients.append(new_ingredient)
  db.session.add(new_meal)
  db.session.commit()
  meal = MealModel.query.get(new_meal.id)
  return meal_schema.jsonify(meal)

@family.route("/<int:family_id>/other_users", methods=["GET"])
@error_handler
@secured
@valid_user
@user_can_read_family
def get_other_users(username, groups, user_id, family_id):
  family = FamilyModel.query.get_or_404(family_id)
  return jsonify(users_schema.dump(family.other_users))

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
@user_can_see_board
def get_board(username, groups, user_id, family_id, board_id):
  # get the board
  board = BoardModel.query.filter(BoardModel.id == board_id, BoardModel.family_id == family_id).first()
  if not board:
    raise ObjectNotFoundException("Board not found")
  return board_schema.jsonify(board)

@family.route("/<int:family_id>/board/<int:board_id>/week", methods=["GET"])
@error_handler
@secured
@valid_user
@user_can_read_family
@user_can_see_board
def get_weeks(username, groups, user_id, family_id, board_id):
  # get the board
  board = BoardModel.query.filter(BoardModel.id == board_id, BoardModel.family_id == family_id).first()
  if not board:
    raise ObjectNotFoundException("Board not found")
  return jsonify(weeks_schema.dump(board.weeks))

@family.route("/<int:family_id>/board/<int:board_id>/week/<int:week_id>", methods=["GET"])
@error_handler
@secured
@valid_user
@user_can_read_family
@user_can_see_board
def get_week(username, groups, user_id, family_id, board_id, week_id):
  # get the week
  week = WeekModel.query.filter(WeekModel.id == week_id, WeekModel.board_id == board_id).first()
  if not week:
    raise ObjectNotFoundException("Week not found")
  return week_schema.jsonify(week)

@family.route("/<int:family_id>/board/<int:board_id>/week/<int:week_id>", methods=["PATCH"])
@error_handler
@secured
@valid_user
@user_can_edit_family
@user_can_see_board
@must_be_json
def change_week(username, groups, user_id, family_id, board_id, week_id):
  week = WeekModel.query.filter(WeekModel.id == week_id, WeekModel.board_id == board_id).first()
  if not week:
    raise ObjectNotFoundException("Week not found")
  if "week_special_name" in request.json:
    setattr(week, "week_special_name", request.json["week_special_name"])
  db.session.commit()
  return week_schema.jsonify(week)

@family.route("/<int:family_id>/board/<int:board_id>/week", methods=["PUT"])
@error_handler
@secured
@valid_user
@user_can_edit_family
@user_can_see_board
@must_be_json
def create_week(username, groups, user_id, family_id, board_id):
  # get the board
  board = BoardModel.query.filter(BoardModel.id == board_id, BoardModel.family_id == family_id).first()
  if not board:
    raise ObjectNotFoundException("Board not found")
  new_week = WeekModel(
    board_id = board.id,
    week_start_date = dateutil.parser.isoparse(request.json["week_start_date"])
  )
  if "week_special_name" in request.json:
    setattr(new_week, "week_special_name", request.json["week_special_name"])
  db.session.add(new_week)
  db.session.commit()
  week = WeekModel.query.get(new_week.id)
  return week_schema.jsonify(week)

@family.route("/<int:family_id>/board/<int:board_id>/week/<int:week_id>/meal", methods=["GET"])
@error_handler
@secured
@valid_user
@user_can_read_family
@user_can_see_board
def get_meals_for_week(username, groups, user_id, family_id, board_id, week_id):
  # get the week
  week = WeekModel.query.filter(WeekModel.id == week_id, WeekModel.board_id == board_id).first()
  if not week:
    raise ObjectNotFoundException("Week not found")
  return jsonify(week_to_meals_schema.dump(week.meals))

@family.route("/<int:family_id>/board/<int:board_id>/week/<int:week_id>/meal/<int:week_to_meal_id>", methods=["GET"])
@error_handler
@secured
@valid_user
@user_can_read_family
@user_can_see_board
def get_meal_for_week(username, groups, user_id, family_id, board_id, week_id, week_to_meal_id):
  # get the week
  week = WeekModel.query.filter(WeekModel.id == week_id, WeekModel.board_id == board_id).first()
  if not week:
    raise ObjectNotFoundException("Week not found")
  week_to_meal = WeekToMealModel.query.filter(WeekToMealModel.week_id==week_id, WeekToMealModel.id == week_to_meal_id).first()
  if not week_to_meal:
    raise ObjectNotFoundException("Meal not found")
  return week_to_meal_schema.jsonify(week_to_meal)

@family.route("/<int:family_id>/board/<int:board_id>/week/<int:week_id>/meal", methods=["PUT", "POST"])
@error_handler
@secured
@valid_user
@user_can_edit_family
@user_can_see_board
@must_be_json
def add_meal_to_week(username, groups, user_id, family_id, board_id, week_id):
  # get the week
  week = WeekModel.query.filter(WeekModel.id == week_id, WeekModel.board_id == board_id).first()
  if not week:
    raise ObjectNotFoundException("Week not found")
  # need to check that mandatory fields are present
  if not "meal_id" in request.json:
    raise BadRequestException("'meal_id' attribute is not present in the request")
  if not "day" in request.json:
    raise BadRequestException("'day' attribute is not present in the request")
  if not "meal_slot" in request.json:
    raise BadRequestException("'meal_slot' attribute is not present in the request")
  meal_id = request.json["meal_id"]
  meal = MealModel.query.filter(MealModel.id == meal_id, MealModel.family_id == family_id).first()
  if not meal:
    raise ObjectNotFoundException("Meal not found")
  # all attributes are here
  new_week_to_meal = WeekToMealModel(
    week_id = week_id,
    meal_id = meal.id,
    meal_slot = request.json["meal_slot"],
    day = dateutil.parser.isoparse(request.json["day"])
  )
  db.session.add(new_week_to_meal)
  db.session.commit()
  return week_to_meal_schema.jsonify(new_week_to_meal)

@family.route("/<int:family_id>/board/<int:board_id>", methods=["DELETE"])
@error_handler
@secured
@valid_user
@user_can_edit_family
@user_can_see_board
def delete_board(username, groups, user_id, family_id, board_id):
  # get the board
  board = BoardModel.query.filter(BoardModel.id == board_id, BoardModel.family_id == family_id).first()
  if not board:
    raise ObjectNotFoundException("Board not found")
  # check that current user is the owner
  if board.owning_user_id == board_id:
    db.session.delete(board)
    db.session.commit()
  else:
    raise AccessDeniedException("You must be the owner to delete a board")

@family.route("/<int:family_id>/board/<int:board_id>", methods=["PATCH"])
@error_handler
@secured
@valid_user
@user_can_edit_family
@user_can_see_board
@must_be_json
def edit_board(username, groups, user_id, family_id, board_id):
  # get the board
  board = BoardModel.query.filter(BoardModel.id == board_id, BoardModel.family_id == family_id).first()
  if not board:
    raise ObjectNotFoundException("Board not found")
  editable_fields = ["board_name", "scope"]
  for field in editable_fields:
    if request.json.get(field):
      if field == "scope":
        setattr(board, field, BoardScopeEnum(request.json[field]).name)
      else:
        setattr(board, field, request.json[field])
  db.session.commit()
  return board_schema.jsonify(board)

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



