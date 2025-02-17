import React, { useState } from 'react';
import { Bookmark, Star, Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

const ExerciseBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([
    {
      id: '1',
      name: 'Push-ups',
      category: 'Strength',
      difficulty: 'Beginner',
      targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
      notes: 'Great for building upper body strength',
      rating: 5,
      dateAdded: '2025-02-15'
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    targetMuscles: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState(null);

  const categories = ['Strength', 'Cardio', 'Flexibility', 'Balance'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filters.category || bookmark.category === filters.category;
    const matchesDifficulty = !filters.difficulty || bookmark.difficulty === filters.difficulty;
    const matchesMuscle = !filters.targetMuscles || bookmark.targetMuscles.includes(filters.targetMuscles);
    return matchesSearch && matchesCategory && matchesDifficulty && matchesMuscle;
  });

  const handleRating = (id, rating) => {
    setBookmarks(bookmarks.map(bookmark =>
      bookmark.id === id ? { ...bookmark, rating } : bookmark
    ));
  };

  const handleDelete = (id) => {
    setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
  };

  const handleAddBookmark = () => {
    const newBookmark = {
      id: Date.now().toString(),
      name: '',
      category: '',
      difficulty: '',
      targetMuscles: [],
      notes: '',
      rating: 0,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    setSelectedBookmark(newBookmark);
  };

  const handleSaveBookmark = (bookmark) => {
    if (bookmark.id && bookmark.name) {
      setBookmarks(prev => {
        const exists = prev.find(b => b.id === bookmark.id);
        if (exists) {
          return prev.map(b => b.id === bookmark.id ? bookmark : b);
        }
        return [...prev, bookmark];
      });
      setSelectedBookmark(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-blue-500" />
              Exercise Bookmarks
            </h1>
            <button
              onClick={handleAddBookmark}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Exercise
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Search and Filter Section */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
                  className="p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Difficulties</option>
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
                <select
                  value={filters.targetMuscles}
                  onChange={(e) => handleFilterChange('targetMuscles', e.target.value)}
                  className="p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Muscle Groups</option>
                  {muscleGroups.map(muscle => (
                    <option key={muscle} value={muscle}>{muscle}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Bookmarks List */}
          <div className="space-y-4">
            {filteredBookmarks.map(bookmark => (
              <div
                key={bookmark.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{bookmark.name}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="mr-4">{bookmark.category}</span>
                      <span className="mr-4">{bookmark.difficulty}</span>
                      <span>{bookmark.targetMuscles.join(', ')}</span>
                    </div>
                    <p className="text-gray-700 mt-2">{bookmark.notes}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRating(bookmark.id, star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= bookmark.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setSelectedBookmark(bookmark)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(bookmark.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Exercise Modal */}
      {selectedBookmark && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {selectedBookmark.id ? 'Edit Exercise' : 'Add New Exercise'}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Exercise Name"
                value={selectedBookmark.name}
                onChange={(e) => setSelectedBookmark({
                  ...selectedBookmark,
                  name: e.target.value
                })}
                className="w-full p-2 border rounded-lg"
              />
              <select
                value={selectedBookmark.category}
                onChange={(e) => setSelectedBookmark({
                  ...selectedBookmark,
                  category: e.target.value
                })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={selectedBookmark.difficulty}
                onChange={(e) => setSelectedBookmark({
                  ...selectedBookmark,
                  difficulty: e.target.value
                })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select Difficulty</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
              <select
                multiple
                value={selectedBookmark.targetMuscles}
                onChange={(e) => setSelectedBookmark({
                  ...selectedBookmark,
                  targetMuscles: Array.from(e.target.selectedOptions, option => option.value)
                })}
                className="w-full p-2 border rounded-lg"
              >
                {muscleGroups.map(muscle => (
                  <option key={muscle} value={muscle}>{muscle}</option>
                ))}
              </select>
              <textarea
                placeholder="Notes"
                value={selectedBookmark.notes}
                onChange={(e) => setSelectedBookmark({
                  ...selectedBookmark,
                  notes: e.target.value
                })}
                className="w-full p-2 border rounded-lg"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedBookmark(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveBookmark(selectedBookmark)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseBookmarks;
