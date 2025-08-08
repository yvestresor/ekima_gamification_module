import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, BookOpen, TrendingUp, Clock, Star } from 'lucide-react';
import SubjectCard from '../components/learning/SubjectCard';
import Loading from '../components/common/Loading';
import { contentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Subjects = () => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const [allSubjects, setAllSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // CRUD state
  const [crudLoading, setCrudLoading] = useState(false);
  const [crudError, setCrudError] = useState(null);
  const [crudSuccess, setCrudSuccess] = useState(null);

  useEffect(() => {
    // Fetch subjects from backend
    setIsLoading(true);
    contentAPI.getSubjects()
      .then(res => {
        setAllSubjects(res.data);
        setFilteredSubjects(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        setError('Failed to load subjects');
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    filterAndSortSubjects();
  }, [searchQuery, selectedFilter, sortBy, allSubjects]);

  const filterAndSortSubjects = () => {
    let filtered = [...allSubjects];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(subject =>
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(subject => {
        switch (selectedFilter) {
          case 'sciences':
            return ['Mathematics', 'Physics', 'Chemistry', 'Biology'].includes(subject.name);
          case 'languages':
            return ['English Language', 'Kiswahili'].includes(subject.name);
          case 'beginner':
            return subject.difficulty_level === 'beginner';
          case 'intermediate':
            return subject.difficulty_level === 'intermediate';
          case 'advanced':
            return subject.difficulty_level === 'advanced';
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'difficulty':
          const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
          return difficultyOrder[a.difficulty_level] - difficultyOrder[b.difficulty_level];
        case 'duration':
          return parseInt(a.estimated_duration) - parseInt(b.estimated_duration);
        default:
          return 0;
      }
    });

    setFilteredSubjects(filtered);
  };

  const handleSubjectClick = (subject) => {
    navigate(`/subject/${subject._id}`);
  };

  const refreshSubjects = async () => {
    try {
      const res = await contentAPI.getSubjects();
      setAllSubjects(res.data);
      setFilteredSubjects(res.data);
    } catch (err) {
      console.error('Failed to refresh subjects:', err);
    }
  };

  // Delete subject handler
  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    
    setCrudLoading(true); 
    setCrudError(null); 
    setCrudSuccess(null);
    
    try {
      await contentAPI.deleteSubject(subjectId);
      setCrudSuccess('Subject deleted successfully');
      // Refresh subjects
      await refreshSubjects();
    } catch (err) {
      setCrudError('Failed to delete subject');
    } finally {
      setCrudLoading(false);
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Subjects', count: allSubjects.length },
    { value: 'sciences', label: 'Sciences', count: allSubjects.filter(s => ['Mathematics', 'Physics', 'Chemistry', 'Biology'].includes(s.name)).length },
    { value: 'languages', label: 'Languages', count: allSubjects.filter(s => ['English Language', 'Kiswahili'].includes(s.name)).length },
    { value: 'beginner', label: 'Beginner', count: allSubjects.filter(s => s.difficulty_level === 'beginner').length },
    { value: 'intermediate', label: 'Intermediate', count: allSubjects.filter(s => s.difficulty_level === 'intermediate').length },
    { value: 'advanced', label: 'Advanced', count: allSubjects.filter(s => s.difficulty_level === 'advanced').length },
  ];

  if (isLoading) {
    return <Loading type="ekima" message="Loading subjects..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Subjects</h1>
            <p className="text-gray-600">Explore our comprehensive curriculum aligned with NECTA standards</p>
          </div>
          {/* Add Subject Button (admin/teacher only) */}
          {user && (hasPermission?.('manage_subjects') || user.role === 'admin' || user.role === 'teacher') && (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              onClick={() => navigate('/subjects/new')}
            >
              + Add Subject
            </button>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{allSubjects.length}</p>
                <p className="text-sm text-gray-600">Total Subjects</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">125</p>
                <p className="text-sm text-gray-600">Total Topics</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">565h</p>
                <p className="text-sm text-gray-600">Total Content</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">NECTA</p>
                <p className="text-sm text-gray-600">Aligned</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
              >
                <option value="name">Sort by Name</option>
                <option value="difficulty">Sort by Difficulty</option>
                <option value="duration">Sort by Duration</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedFilter !== 'all') && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-orange-600 hover:text-orange-800"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {selectedFilter !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Filter: {filterOptions.find(f => f.value === selectedFilter)?.label}
                  <button
                    onClick={() => setSelectedFilter('all')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            Showing {filteredSubjects.length} of {allSubjects.length} subjects
          </p>
        </div>

        {/* CRUD Feedback */}
        {crudLoading && <div className="text-blue-600 mb-2">Processing...</div>}
        {crudSuccess && <div className="text-green-600 mb-2">{crudSuccess}</div>}
        {crudError && <div className="text-red-600 mb-2">{crudError}</div>}

        {/* Subjects Grid */}
        {filteredSubjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subject) => (
              <div key={subject._id} className="relative">
                <SubjectCard
                  subject={subject}
                  onClick={() => handleSubjectClick(subject)}
                />
                {/* Edit/Delete controls (admin/teacher only) */}
                {user && (hasPermission?.('manage_subjects') || user.role === 'admin' || user.role === 'teacher') && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/subjects/${subject._id}/edit`);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubject(subject._id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No subjects found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
              Choose a subject that interests you and begin your journey to academic excellence with our interactive content and personalized recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/progress')}
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-orange-50 transition-colors"
              >
                View My Progress
              </button>
              <button 
                onClick={() => navigate('/')}
                className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-orange-600 transition-colors"
              >
                Get Recommendations
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subjects;