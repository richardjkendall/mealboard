from models.shared import db, ma

class WeekToMealModel(db.Model):
  __tablename__ = "week2meal"

  id = db.Column(db.Integer, index=True, primary_key=True)
  week_id = db.Column(db.Integer, db.ForeignKey('week.id'), index=True, nullable=False)
  week = db.relationship('WeekModel', backref=db.backref('week', lazy=True))
  meal_id = db.Column(db.Integer, db.ForeignKey('meal.id'), index=True, nullable=False)
  meal = db.relationship('MealModel', backref=db.backref('meal', lazy=True))
  meal_slot = db.Column(db.String(50), nullable=False)
  day = db.Column(db.String(10), nullable=False)

class WeekToMealSchema(ma.Schema):

  class Meta:
    fields = ('id', 'week_id', 'meal_id', 'meal_slot', 'day')