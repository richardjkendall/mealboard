"""
Useful bits of code
"""
import logging
import sys
import random
from functools import wraps

from flask import make_response, jsonify, request

from error_handler import error_handler

logger = logging.getLogger(__name__)

def must_be_json(f):
  """
  Decorator to check that a request is JSON
  """
  @wraps(f)
  def decorated_function(*args, **kwargs):
    logger.info("must_be_json decorator has started")
    if not request.json:
      logger.info("Sending exception as request should be JSON")
      raise error_handler.BadRequestException("Request body should be JSON")
    return f(*args, **kwargs)
  
  return decorated_function

def format_sse(data: str, event=None) -> str:
  msg = f'data: {data}\n\n'
  if event is not None:
    msg = f'event: {event}\n{msg}'
  return msg

def get_rand_string(number_of_characters):
    chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    rnd = random.SystemRandom()
    out = ""
    for d in range(number_of_characters):
        i = rnd.randint(0, sys.maxsize)
        i = i % len(chars)
        out = out + chars[i:i+1]
    return out

def check_for_keys(dict, keys):
  missing = []
  for key in keys:
    if key not in dict:
      missing.append(key)
  if len(missing) > 0:
    return missing
  else:
    return False

def success_json_response(payload):
  """
  Turns payload into a JSON HTTP200 response
  """
  response = make_response(jsonify(payload), 200)
  response.headers["Content-type"] = "application/json"
  return response

def generic_exception_json_response(code):
    """
    Turns an unhandled exception into a JSON payload to respond to a service call
    """
    payload = {
        "error": "TechnicalException",
        "message": "An unknown error occured",
        "code": code
    }
    resp = make_response(jsonify(payload), code)
    resp.headers["Content-type"] = "application/json"
    return resp