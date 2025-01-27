import csv
import json


def getGymDataSet():
    # Read CSV data
    with open('the-cardio-coders/src/Data/megaGymDataset.csv', 'r') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        data = [row for row in csv_reader]

    # Convert to JSON
    json_data = json.dumps(data, indent=4)

    # Write to JSON file
    with open('megaGymDataSetOutput.json', 'w') as json_file:
        json_file.write(json_data)



