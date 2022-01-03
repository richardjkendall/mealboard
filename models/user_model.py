from marshmallow import fields
from marshmallow_enum import EnumField

from models.shared import db, ma

import enum

class UserRoleEnum(enum.Enum):
  EDIT = "edit"
  VIEW = "view"

class UserModel(db.Model):
  __tablename__ = "user"

  id = db.Column(db.Integer, index=True, primary_key=True)
  username = db.Column(db.String(120), index=True, nullable=False)
  first_name = db.Column(db.String(120), nullable=False)
  last_name = db.Column(db.String(120), nullable=False)
  join_date = db.Column(db.DateTime(), nullable=False)
  enabled = db.Column(db.Boolean(), nullable=False)
  families = db.relationship('FamilyModel', secondary='user2family', back_populates='other_users')

class UserSchema(ma.Schema):
  #families = fields.Nested(FamilySchema, many=True)

  class Meta:
    fields = ('id', 'username', 'first_name', 'last_name', 'join_date', 'enabled')

