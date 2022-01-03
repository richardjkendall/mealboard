from marshmallow import fields
from marshmallow_enum import EnumField

from models.shared import db, ma

import enum

class UserRoleEnum(enum.Enum):
  EDIT = "edit"
  VIEW = "view"

class UserToFamilyModel(db.Model):
  __tablename__ = "user2family"

  id = db.Column(db.Integer, index=True, primary_key=True)
  family_id = db.Column(db.Integer, db.ForeignKey('family.id'), index=True, nullable=False)
  #family = db.relationship('FamilyModel', backref=db.backref('family', lazy=True))
  user_id = db.Column(db.Integer, db.ForeignKey('user.id'), index=True, nullable=False)
  #user = db.relationship('UserModel', backref=db.backref('user', lazy=True))
  role = db.Column(db.Enum(UserRoleEnum), nullable=False)

class UserToFamilySchema(ma.Schema):
  role = EnumField(UserRoleEnum, by_value=True)

  class Meta:
    fields = ('id', 'family_id', 'user_id', 'role')