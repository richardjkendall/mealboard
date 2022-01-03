from functools import wraps
from flask import make_response, jsonify

class BadRequestException(Exception):
    """Class for BadRequestException"""
    def __init__(self, *args, **kwargs):
        Exception.__init__(self, *args, **kwargs)

class SystemFailureException(Exception):
    """Class for SystemFailureException"""
    def __init__(self, *args, **kwargs):
        Exception.__init__(self, *args, **kwargs)

class AccessDeniedException(Exception):
    """Class for AccessDeniedException"""
    def __init__(self, *args, **kwargs):
        Exception.__init__(self, *args, **kwargs)

class ObjectNotFoundException(Exception):
    """Class for ObjectNotFoundException"""
    def __init__(self, *args, **kwargs):
        Exception.__init__(self, *args, **kwargs)

def exception_to_json_response(exception, code):
    """
    Turns an exception into a JSON payload to respond to a service call
    """
    payload = {
        "error": type(exception).__name__,
        "message": str(exception),
        "code": code
    }
    resp = make_response(jsonify(payload), code)
    resp.headers["Content-type"] = "application/json"
    return resp

def error_handler(f):
    """
    Function to manage errors coming back to webservice calls
    """

    @wraps(f)
    def error_decorator(*args, **kwargs):
        """
        Function to manage errors coming back to webservice calls
        """
        try:
            return f(*args, **kwargs)
        except BadRequestException as err:
            return exception_to_json_response(err, 400)
        except AccessDeniedException as err:
            return exception_to_json_response(err, 401)
        except ObjectNotFoundException as err:
            return exception_to_json_response(err, 404)
        except SystemFailureException as err:
            return exception_to_json_response(err, 500)
        #except Exception as err:
        #    return generic_exception_json_response(500)
    return error_decorator