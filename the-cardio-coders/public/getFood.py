import pandas as pd
import random

def load_food_data(file_path):
    return pd.read_csv(file_path)

def high_protein_meal(df, num_items=20):
    high_protein_df = df.sort_values(by='Protein (g)', ascending=False).head(203)
    return high_protein_df.sample(n=num_items)

def low_carb_meal(df, num_items=20):
    low_carb_df = df.sort_values(by='Carbohydrates (g)', ascending=True).head(203)
    return low_carb_df.sample(n=num_items)

def balanced_meal(df, num_items=20):
    balanced_df = df[(df['Protein (g)'] > df['Protein (g)'].median()) & 
                     (df['Carbohydrates (g)'] > df['Carbohydrates (g)'].median()) &
                     (df['Fats (g)'] > df['Fats (g)'].median())]
    return balanced_df.sample(n=min(num_items, len(balanced_df)))

def main():
    file_path = "200food.csv"  
    df = load_food_data(file_path)
    
    print("High-Protein Meal Plan:")
    print(high_protein_meal(df))
    
    print("\nLow-Carb Meal Plan:")
    print(low_carb_meal(df))
    
    print("\nBalanced Meal Plan:")
    print(balanced_meal(df))

if __name__ == "__main__":
    main()
