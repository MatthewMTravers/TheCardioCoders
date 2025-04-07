import React, { useState, useEffect } from 'react';
import { Bookmark, Search, Filter, X, ChevronDown, ChevronUp, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import initialExercisesData from './Bookmarks.json';

const ExerciseBookmarksPage = () => {
  const navigate = useNavigate();

  const [exercises, setExercises] = useState(initialExercisesData.exercises);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    targetMuscles: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Update Bookmarks.json whenever exercises change
  useEffect(() => {
    const updateBookmarksJson = async () => {
      try {
        // This is a placeholder. In a real React app, you'd use a backend API
        // to update the JSON file. For client-side, this won't actually work.
        await fetch('/update-bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ exercises })
        });
      } catch (error) {
        console.error('Failed to update Bookmarks.json', error);
      }
    };

    updateBookmarksJson();
  }, [exercises]);

  const categories = ['Strength', 'Cardio', 'Flexibility', 'Balance'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filters.category || exercise.category === filters.category;
    const matchesDifficulty = !filters.difficulty || exercise.difficulty === filters.difficulty;
    const matchesMuscle = !filters.targetMuscles || exercise.targetMuscles.includes(filters.targetMuscles);
    return matchesSearch && matchesCategory && matchesDifficulty && matchesMuscle;
  });

  const handleAddExercise = () => {
    const newExercise = {
      id: Date.now().toString(),
      name: '',
      category: '',
      difficulty: '',
      targetMuscles: [],
      description: '',
      steps: [],
      benefits: [],
      equipment: [],
      variations: []
    };
    setSelectedExercise(newExercise);
  };

  const handleSaveExercise = () => {
    if (!selectedExercise.name) {
      alert('Exercise name is required');
      return;
    }

    setExercises(prev => {
      // Check if exercise already exists (edit)
      const existingIndex = prev.findIndex(e => e.id === selectedExercise.id);
      
      if (existingIndex !== -1) {
        // Update existing exercise
        const updatedExercises = [...prev];
        updatedExercises[existingIndex] = selectedExercise;
        return updatedExercises;
      } else {
        // Add new exercise
        return [...prev, selectedExercise];
      }
    });

    setSelectedExercise(null);
  };

  const handleDeleteExercise = (id) => {
    setExercises(prev => prev.filter(exercise => exercise.id !== id));
  };

  const handleBackToChat = () => {
    navigate('/chat');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBackToChat}
              className="hover:bg-gray-100 p-2 rounded-full"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-blue-500" />
              Exercise Library
            </h1>
          </div>
          <button
            onClick={handleAddExercise}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-5 h-5" />
            Add Exercise
          </button>
        </div>
        
        <div className="p-6">
          {/* Search and Filter Section */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-5 h-5" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="p-2 border rounded-lg"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="p-2 border rounded-lg"
                >
                  <option value="">All Difficulties</option>
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
                <select
                  value={filters.targetMuscles}
                  onChange={(e) => handleFilterChange('targetMuscles', e.target.value)}
                  className="p-2 border rounded-lg"
                >
                  <option value="">All Muscle Groups</option>
                  {muscleGroups.map(muscle => (
                    <option key={muscle} value={muscle}>{muscle}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Exercises List */}
          {exercises.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No exercises added yet. Click "Add Exercise" to get started!
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredExercises.map(exercise => (
                <div 
                  key={exercise.id} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{exercise.name}</h3>
                      <div className="text-sm text-gray-600 mt-1">
                        {exercise.category} | {exercise.difficulty}
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        Muscles: {exercise.targetMuscles.join(', ')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedExercise(exercise)}
                        className="text-blue-500 hover:bg-blue-50 p-2 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteExercise(exercise.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Exercise Edit Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedExercise.id ? 'Edit Exercise' : 'Add New Exercise'}
            </h2>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Exercise Name"
                value={selectedExercise.name}
                onChange={(e) => setSelectedExercise(prev => ({
                  ...prev, 
                  name: e.target.value
                }))}
                className="w-full p-2 border rounded-lg"
              />
              
              <div className="grid md:grid-cols-2 gap-4">
                <select
                  value={selectedExercise.category}
                  onChange={(e) => setSelectedExercise(prev => ({
                    ...prev, 
                    category: e.target.value
                  }))}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select
                  value={selectedExercise.difficulty}
                  onChange={(e) => setSelectedExercise(prev => ({
                    ...prev, 
                    difficulty: e.target.value
                  }))}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select Difficulty</option>
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
              </div>
              
              <select
                multiple
                value={selectedExercise.targetMuscles}
                onChange={(e) => setSelectedExercise(prev => ({
                  ...prev, 
                  targetMuscles: Array.from(e.target.selectedOptions, option => option.value)
                }))}
                className="w-full p-2 border rounded-lg"
              >
                {muscleGroups.map(muscle => (
                  <option key={muscle} value={muscle}>{muscle}</option>
                ))}
              </select>
              
              <textarea
                placeholder="Description"
                value={selectedExercise.description}
                onChange={(e) => setSelectedExercise(prev => ({
                  ...prev, 
                  description: e.target.value
                }))}
                className="w-full p-2 border rounded-lg"
                rows={3}
              />
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveExercise}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save Exercise
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseBookmarksPage;
