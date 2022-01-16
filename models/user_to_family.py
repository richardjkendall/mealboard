from marshmallow import fields
from marshmallow_enum import EnumField

from models.user_model import UserSchema
from models.shared import db, ma

import enum

class UserRoleEnum(enum.Enum):
  EDIT = "edit"
  VIEW = "view"

class UserToFamilyModel(db.Model):
  __tablename__ = "user2family"

  id = db.Column(db.Integer, index=True, primary_key=True)
  family_id = db.Column(db.Integer, db.ForeignKey('family.id'), index=True, nullable=False)
  user_id = db.Column(db.Integer, db.ForeignKey('user.id'), index=True, nullable=False)
  #family = db.relationship('FamilyModel', backref=db.backref('families', lazy=True))
  user = db.relationship('UserModel', backref=db.backref('users', lazy=True))
  role = db.Column(db.Enum(UserRoleEnum), nullable=False)

class UserToFamilySchema(ma.Schema):
  role = EnumField(UserRoleEnum, by_value=True)
  user = fields.Nested(UserSchema)

  class Meta:
    fields = ('id', 'family_id', 'user_id', 'role', 'user')