import os
import json
import re
from typing import Dict, List, Optional, Tuple, Union

# Get the script's directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# Path to the exercise video mapping file
EXERCISE_VIDEO_MAPPING_PATH = os.path.join(script_dir, 'exercise_videos.json')

def load_exercise_video_mapping() -> Dict:
    """Load the exercise video mapping from the JSON file."""
    try:
        with open(EXERCISE_VIDEO_MAPPING_PATH, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading exercise video mapping: {e}")
        return {"exercises": []}

def find_exercise_videos(exercise_name: str) -> Optional[Dict]:
    """
    Find videos for a given exercise name by checking against exercise names and variations.
    Returns the matching exercise data including video URLs or None if no match is found.
    """
    exercise_mapping = load_exercise_video_mapping()
    
    # Normalize the input exercise name: lowercase and remove special characters
    normalized_name = re.sub(r'[^a-zA-Z0-9\s]', '', exercise_name.lower())
    
    for exercise in exercise_mapping["exercises"]:
        # Check the main exercise name
        if normalized_name == exercise["name"].lower():
            return exercise
            
        # Check variations
        for variation in exercise["variations"]:
            if normalized_name == variation.lower():
                return exercise
            
        # Check if the normalized name contains the exercise name or any variation
        if exercise["name"].lower() in normalized_name:
            return exercise
            
        for variation in exercise["variations"]:
            if variation.lower() in normalized_name:
                return exercise
    
    return None

def extract_exercise_names_from_text(text: str) -> List[str]:
    """
    Extract potential exercise names from text.
    This is a simple implementation that can be enhanced with NLP techniques.
    """
    exercise_mapping = load_exercise_video_mapping()
    found_exercises = []
    
    # Create a list of all exercise names and variations
    all_exercise_terms = []
    for exercise in exercise_mapping["exercises"]:
        all_exercise_terms.append(exercise["name"])
        all_exercise_terms.extend(exercise["variations"])
    
    # Search for each exercise term in the text
    for term in all_exercise_terms:
        if term.lower() in text.lower():
            found_exercises.append(term)
    
    return found_exercises

def get_video_links_for_text(text: str) -> List[Dict]:
    """
    Analyze text and return video links for any exercises mentioned.
    Returns a list of dictionaries with exercise data.
    """
    exercise_names = extract_exercise_names_from_text(text)
    results = []
    
    # Remove duplicates while preserving order
    seen = set()
    unique_exercises = [x for x in exercise_names if not (x in seen or seen.add(x))]
    
    for name in unique_exercises:
        exercise_data = find_exercise_videos(name)
        if exercise_data and exercise_data not in results:
            results.append(exercise_data)
    
    return results