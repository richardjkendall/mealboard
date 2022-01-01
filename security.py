"""
security.py
Contains code which manages access to API routes
"""
import logging
from functools import wraps
from flask import request

from models.user_model import UserModel
from error_handler import SystemFailureException, BadRequestException

logger = logging.getLogger(__name__)

def valid_user(f):
  """
  Decorator to check that a request has valid user
  """
  @wraps(f)
  def decorated_function(username, groups, *args, **kwargs):
    logger.info("valid_user decorator has started")
    if not username:
      raise SystemFailureException("Call to valid_user with no username")
    user = UserModel.query.filter(UserModel.username == username).first()
    if not user:
      raise BadRequestException("User is not registered")
    return f(username, groups, *args, **kwargs)
  
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
      return f("anonymous", [], *args, **kwargs)
  
  return decorated_function