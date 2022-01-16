from marshmallow import fields

from models.shared import db, ma
from models.ingredient_model import IngredientSchema

class MealModel(db.Model):
    __tablename__ = "meal"
    
    id = db.Column(db.Integer, index=True, primary_key=True)
    meal_name = db.Column(db.String(120), nullable=False)
    family_id = db.Column(db.Integer, db.ForeignKey('family.id'), index=True, nullable=False)
    family = db.relationship('FamilyModel', backref=db.backref('meals', lazy=True))
    portions = db.Column(db.Integer, nullable=True)

class MealSchema(ma.Schema):
    ingredients = fields.Nested(IngredientSchema, many=True)

    class Meta:
        fields = ('id', 'meal_name', 'family_id', 'portions', 'ingredients')