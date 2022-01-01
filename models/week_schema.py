from marshmallow import fields

from models.shared import db, ma

class WeekModel(db.Model):
  __tablename__ = "week"

  id = db.Column(db.Integer, index=True, primary_key=True)
  week_start_date = db.Column(db.DateTime(), nullable=False)
  week_special_name = db.Column(db.String(120), nullable=True)
  board_id = db.Column(db.Integer, db.ForeignKey('board.id'), index=True, nullable=False)
  board = db.relationship('BoardModel', backref=db.backref('board', lazy=True))

class WeekSchema(ma.Schema):
  
  class Meta:
    fields = ('id', 'week_start_date', 'week_special_name', 'board_id')