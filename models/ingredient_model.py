from models.shared import db, ma

class IngredientModel(db.Model):
    __tablename__ = "ingredient"

    id = db.Column(db.Integer, index=True, primary_key=True)
    meal_id = db.Column(db.Integer, db.ForeignKey('meal.id'), index=True, nullable=False)
    meal = db.relationship('MealModel', backref=db.backref('ingredients', lazy=True))
    ingredient_name = db.Column(db.String(120), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit = db.Column(db.String(50), nullable=False)

class IngredientSchema(ma.Schema):
    class Meta:
        fields = ('id', 'meal_id', 'ingredient_name', 'quanity', 'unit')