import pandas as pd

def load_food_data(file_path):
    return pd.read_csv(file_path)

def calculate_nutritional_needs(food_data, selected_foods, target_requirements):
    import numpy as np
    
    selected_data = food_data[food_data["Food Name"].isin(selected_foods)]
    nutrients = ["Calories (kcal)", "Protein (g)", "Carbohydrates (g)", "Fats (g)"]
    
    # Extract nutrient values per 100g
    nutrient_matrix = selected_data[nutrients].values
    requirement_vector = np.array([target_requirements[n] for n in nutrients])
    
    # Solve for the food portions (X) such that nutrient_matrix * X = requirement_vector
    try:
        portions = np.linalg.lstsq(nutrient_matrix.T, requirement_vector, rcond=None)[0]
        portions = np.maximum(portions, 0)  # Ensure non-negative values
    except np.linalg.LinAlgError:
        return "Error: Cannot determine portions due to linear dependency in food selection."
    
    return {food: round(amount, 2) for food, amount in zip(selected_data["Food Name"], portions)}

def calculate_standard_nutrition(weight, height):
    calories = 25 * weight  # Approximate calorie needs per kg
    protein = 0.8 * weight  # Recommended protein intake per kg
    carbs = (calories * 0.5) / 4  # 50% of calories from carbs (4 kcal/g)
    fats = (calories * 0.3) / 9  # 30% of calories from fats (9 kcal/g)
    
    return {
        "Calories (kcal)": round(calories, 2),
        "Protein (g)": round(protein, 2),
        "Carbohydrates (g)": round(carbs, 2),
        "Fats (g)": round(fats, 2),
    }

def main():
    file_path = "200food.csv"  # Update with actual file path
    food_data = load_food_data(file_path)
    
    print("Available foods:")
    print(food_data["Food Name"].tolist())
    
    selected_foods = input("Enter the foods you want to include (comma-separated): ").split(", ")
    
    weight = float(input("Enter your weight (kg): "))
    height = float(input("Enter your height (cm): "))
    
    daily_requirements = calculate_standard_nutrition(weight, height)
    print("Your standard daily nutritional needs:", daily_requirements)
    
    target_calories = float(input("Enter your target calorie intake (kcal): "))
    target_requirements = {
        "Calories (kcal)": target_calories,
        "Protein (g)": daily_requirements["Protein (g)"] * (target_calories / daily_requirements["Calories (kcal)"]),
        "Carbohydrates (g)": daily_requirements["Carbohydrates (g)"] * (target_calories / daily_requirements["Calories (kcal)"]),
        "Fats (g)": daily_requirements["Fats (g)"] * (target_calories / daily_requirements["Calories (kcal)"])
    }
    
    print("Your adjusted nutritional requirements based on target calories:", target_requirements)
    
    result = calculate_nutritional_needs(food_data, selected_foods, target_requirements)
    print("Suggested intake (grams) to meet target calories:", result)
    
if __name__ == "__main__":
    main()
