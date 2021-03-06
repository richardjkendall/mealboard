from marshmallow import fields

from models.shared import db, ma
from models.meal_model import MealSchema
from models.user_model import UserSchema
from models.user_to_family import UserToFamilySchema
from models.board_model import BoardSchema

class FamilyModel(db.Model):
  __tablename__ = "family"

  id = db.Column(db.Integer, index=True, primary_key=True)
  
  family_name = db.Column(db.String(120), nullable=False)

  primary_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), index=True, nullable=False)
  primary_user = db.relationship('UserModel', backref=db.backref('primary_user', lazy=True))

  other_users = db.relationship('UserToFamilyModel', back_populates="family")

class FamilySchema(ma.Schema):
  other_users = fields.Nested(UserToFamilySchema, many=True)
  meals = fields.Nested(MealSchema, many=True)
  boards = fields.Nested(BoardSchema, many=True)
  primary_user = fields.Nested(UserSchema)
  
  class Meta:
    fields = ('id', 'family_name', 'primary_user_id', 'boards', 'meals', 'other_users', 'primary_user')