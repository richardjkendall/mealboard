from marshmallow import fields

from models.shared import db, ma
from models.board_model import BoardSchema

import enum

class UserRoleEnum(enum.Enum):
  EDIT = "edit"
  VIEW = "view"

class UserModel(db.Model):
  __tablename__ = "user"

  id = db.Column(db.Integer, index=True, primary_key=True)
  username = db.Column(db.String(120), index=True, nullable=False)
  first_name = db.Column(db.String(120), nullable=True)
  last_name = db.Column(db.String(120), nullable=True)
  join_date = db.Column(db.DateTime(), nullable=True)
  enabled = db.Column(db.Boolean(), nullable=False)
  default_board_id = db.Column(db.Integer, db.ForeignKey('board.id'), nullable=True)
  default_board = db.relationship('BoardModel', foreign_keys=[default_board_id])
  families = db.relationship('UserToFamilyModel', back_populates="user")

class UserSchema(ma.Schema):
  default_board = fields.Nested(BoardSchema(exclude=["weeks"]), many=False)

  class Meta:
    fields = ('id', 'username', 'first_name', 'last_name', 'join_date', 'enabled', 'default_board_id', 'default_board')

