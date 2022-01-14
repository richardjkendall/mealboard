from marshmallow import fields

from models.shared import db, ma

from models.meal_model import MealSchema

class WeekToMealModel(db.Model):
  __tablename__ = "week2meal"

  id = db.Column(db.Integer, index=True, primary_key=True)
  week_id = db.Column(db.Integer, db.ForeignKey('week.id'), index=True, nullable=False)
  meal_id = db.Column(db.Integer, db.ForeignKey('meal.id'), index=True, nullable=False)
  week = db.relationship('WeekModel', backref=db.backref('weeks', lazy=True))
  meal = db.relationship('MealModel', backref=db.backref('meals', cascade="delete", lazy=True))
  meal_slot = db.Column(db.String(50), nullable=False)
  day = db.Column(db.DateTime(), index=True, nullable=False)

class WeekToMealSchema(ma.Schema):
  meal = fields.Nested(MealSchema)

  class Meta:
    fields = ('id', 'week_id', 'meal_id', 'meal_slot', 'day', 'meal')