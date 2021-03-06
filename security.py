"""
security.py
Contains code which manages access to API routes
"""
import logging, os
from functools import wraps
from flask import request
from sqlalchemy import or_

from models.user_model import UserModel
from models.user_to_family import UserToFamilyModel, UserRoleEnum
from models.family_model import FamilyModel
from models.board_model import BoardModel, BoardScopeEnum
from error_handler import ObjectNotFoundException, SystemFailureException, BadRequestException

logger = logging.getLogger(__name__)

def user_can_see_board(f):
  """
  Decorator to check that a user can see a board
  """
  @wraps(f)
  def decorated_function(username, groups, user_id, family_id, board_id, *args, **kwargs):
    logger.info("user_can_see_board decorator has started, checking if board is private and user owns it")
    board = BoardModel.query.filter(BoardModel.family_id == family_id, BoardModel.id == board_id, BoardModel.owning_user_id == user_id, BoardModel.scope == BoardScopeEnum.PRIVATE).first()
    if board:
      logger.info("Board is private and owned by this user")
      return f(username, groups, user_id, family_id, board_id, *args, **kwargs)
    board = BoardModel.query.filter(BoardModel.family_id == family_id, BoardModel.id == board_id, or_(BoardModel.scope == BoardScopeEnum.FAMILY, BoardModel.scope == BoardScopeEnum.PUBLIC)).first()
    if board:
      logger.info("Board scope is family or public")
      return f(username, groups, user_id, family_id, board_id, *args, **kwargs)
    logger.info("User should not be able to see the view")
    raise ObjectNotFoundException("Board not found")
  return decorated_function

def user_can_read_family(f):
  """
  Decorator to check that a user is allowed to edit a family
  """
  @wraps(f)
  def decorated_function(username, groups, user_id, family_id, *args, **kwargs):
    logger.info("user_can_edit_family decorater has started, checking if user is family owner")
    family = FamilyModel.query.filter(FamilyModel.id == family_id, FamilyModel.primary_user_id == user_id).first()
    if family:
      logger.info("User is family owner")
      return f(username, groups, user_id, family_id, *args, **kwargs)
    user2family = UserToFamilyModel.query.filter(UserToFamilyModel.user_id == user_id, UserToFamilyModel.family_id == family_id).first()
    if user2family:
      logger.info("User has relationship to family")
      return f(username, groups, user_id, family_id, *args, **kwargs)
    logger.info("User is not family owner and has no relationship to family")
    raise ObjectNotFoundException("No such family found")
  
  return decorated_function

def user_can_edit_family(f):
  """
  Decorator to check that a user is allowed to edit a family
  """
  @wraps(f)
  def decorated_function(username, groups, user_id, family_id, *args, **kwargs):
    logger.info("user_can_edit_family decorater has started, checking if user is family owner")
    family = FamilyModel.query.filter(FamilyModel.id == family_id, FamilyModel.primary_user_id == user_id).first()
    if family:
      logger.info("User is family owner")
      return f(username, groups, user_id, family_id, *args, **kwargs)
    user2family = UserToFamilyModel.query.filter(UserToFamilyModel.user_id == user_id, UserToFamilyModel.family_id == family_id, UserToFamilyModel.role == UserRoleEnum.EDIT).first()
    if user2family:
      logger.info("User has relationship to family with edit role")
      return f(username, groups, user_id, family_id, *args, **kwargs)
    logger.info("User is not family owner and has no relationship to family")
    raise ObjectNotFoundException("You are not allowed to make changes")
  
  return decorated_function

def valid_user(f):
  """
  Decorator to check that a request has valid user
  """
  @wraps(f)
  def decorated_function(username, groups, *args, **kwargs):
    logger.info("valid_user decorator has started")
    if not username:
      logger.info("No username in request")
      raise SystemFailureException("Call to valid_user with no username")
    user = UserModel.query.filter(UserModel.username == username).first()
    if not user:
      logger.info("User does not exist in database")
      raise BadRequestException("User is not registered")
    return f(username, groups, user.id, *args, **kwargs)
  
  return decorated_function

def secured(f):
  """
  Decorator to check that a request has valid headers and matches the requirements
  """
  @wraps(f)
  def decorated_function(*args, **kwargs):
    """
    Function to check headers are present and check their validity
    """
    logger.info("Secured decorator has started")
    logger.debug("Details passed to the secured decorator", extra={"headers": request.headers})
    if "x-remote-user" in request.headers:
      username = request.headers["x-remote-user"]
      logger.info(f"User is {username}")
      if "x-remote-user-groups" in request.headers:
        groups = request.headers["x-remote-user-groups"]
        logger.info(f"Groups from header: {groups}")
        groups = groups.split(",")
        return f(username, groups, *args, **kwargs)
      else:
        logger.info("X-Remote-User-Groups header is missing from request")
        return f(username, [], *args, **kwargs)
    else:
      logger.info("X-Remote-User header is missing from request")
      return f(os.environ.get("INJECTED_USER"), [], *args, **kwargs)
  
  return decorated_function