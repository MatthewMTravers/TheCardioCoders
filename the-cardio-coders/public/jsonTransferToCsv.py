import pandas as pd

# Load JSON file
json_file = "mealJustNameAndNutri.json"  # Replace with your JSON file name
csv_file = "mealdata.csv"  # Replace with your desired CSV file name

# Read JSON and convert to DataFrame
df = pd.read_json(json_file)

# Save DataFrame to CSV
df.to_csv(csv_file, index=False)

print(f"CSV file '{csv_file}' created successfully!")
