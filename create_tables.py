from models.week_to_meal import WeekToMealModel, WeekToMealSchema
from models.family_model import FamilyModel, FamilySchema
from models.user_model import UserModel, UserSchema
from models.board_model import BoardModel, BoardSchema
from models.ingredient_model import IngredientModel, IngredientSchema
from models.meal_model import MealModel, MealSchema
from models.user_to_family import UserToFamilyModel, UserToFamilySchema
from models.week_model import WeekModel, WeekSchema

def build_all_tables(db, app):
  db.create_all(app=app)
