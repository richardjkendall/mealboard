from marshmallow import fields
from marshmallow_enum import EnumField

from models.shared import db, ma

from models.week_model import WeekSchema

import enum

class BoardScopeEnum(enum.Enum):
  PRIVATE = "private"
  FAMILY = "family"
  PUBLIC = "public"

class BoardModel(db.Model):
  __tablename__ = "board"

  id = db.Column(db.Integer, index=True, primary_key=True)
  board_name = db.Column(db.String(120), nullable=False)
  owning_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), index=True, nullable=False)
  owning_user = db.relationship('UserModel', backref=db.backref('owning_user', lazy=True))
  scope = db.Column(db.Enum(BoardScopeEnum), nullable=False)
  family_id = db.Column(db.Integer, db.ForeignKey('family.id'), index=True, nullable=False)
  family = db.relationship('FamilyModel', backref=db.backref('boards', lazy=True))

class BoardSchema(ma.Schema):
  weeks = fields.Nested(WeekSchema, many=True)
  scope = EnumField(BoardScopeEnum, by_value=True)
  
  class Meta:
    fields = ('id', 'board_name', 'owning_user_id', 'scope', 'family_id', 'weeks')