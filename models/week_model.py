from marshmallow import fields

from models.shared import db, ma

from models.meal_model import MealSchema
from models.week_to_meal import WeekToMealSchema

class WeekModel(db.Model):
  __tablename__ = "week"

  id = db.Column(db.Integer, index=True, primary_key=True)
  week_start_date = db.Column(db.DateTime(), index=True, nullable=False)
  week_special_name = db.Column(db.String(120), nullable=True)
  board_id = db.Column(db.Integer, db.ForeignKey('board.id'), index=True, nullable=False)
  board = db.relationship('BoardModel', backref=db.backref('weeks', lazy=True))
  meals = db.relationship('WeekToMealModel')

class WeekSchema(ma.Schema):
  meals = fields.Nested(WeekToMealSchema, many=True)
  
  class Meta:
    fields = ('id', 'week_start_date', 'week_special_name', 'board_id', 'meals')