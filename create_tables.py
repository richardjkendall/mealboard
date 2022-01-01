from app import db, app
from models.family_model import FamilyModel, FamilySchema
from models.user_model import UserModel, UserSchema
from models.board_model import BoardModel, BoardSchema
from models.ingredient_model import IngredientModel, IngredientSchema
from models.meal_model import MealModel, MealSchema
from models.user_to_family import UserToFamilyModel, UserToFamilySchema
from models.week_schema import WeekModel, WeekSchema
from models.week_to_meal import WeekToMealModel, WeekToMealSchema

db.create_all(app=app)
