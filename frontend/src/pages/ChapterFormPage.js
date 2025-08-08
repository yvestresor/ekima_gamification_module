import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Save, 
  X, 
  BookOpen, 
  Clock, 
  Target, 
  List,
  Plus,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { contentAPI } from '../services/api';
import Loading from '../components/common/Loading';

const ChapterFormPage = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  
  // Get topicId from query parameters
  const searchParams = new URLSearchParams(location.search);
  const topicId = searchParams.get('topicId');
  
  // Determine mode from URL or location state
  const isEdit = location.pathname.includes('/edit');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: '',
    estimatedTime: '',
    order: '',
    contentTypes: [],
    learningObjectives: [],
    prerequisites: []
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [topicData, setTopicData] = useState(null);
  
  // Temporary input states for arrays
  const [newContentType, setNewContentType] = useState('');
  const [newLearningObjective, setNewLearningObjective] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');

  // Predefined options
  const difficultyOptions = ['beginner', 'intermediate', 'advanced'];
  const contentTypeOptions = ['videos', 'experiments', 'simulations', 'readings', 'quizzes', 'interactive'];

  // Load chapter data for editing
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load topic data
        if (topicId) {
          const topicRes = await contentAPI.getTopic(topicId);
          setTopicData(topicRes.data);
        }
        
        // Load chapter data for editing
        if (isEdit && chapterId) {
          const chapterRes = await contentAPI.getChapter(chapterId);
          const chapter = chapterRes.data;
          setFormData({
            name: chapter.name || '',
            description: chapter.description || '',
            difficulty: chapter.difficulty || '',
            estimatedTime: chapter.estimatedTime || '',
            order: chapter.order || '',
            contentTypes: chapter.contentTypes || [],
            learningObjectives: chapter.learningObjectives || [],
            prerequisites: chapter.prerequisites || []
          });
        }
      } catch (err) {
        setError('Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (topicId) {
      loadData();
    } else {
      setError('Topic ID is required');
    }
  }, [isEdit, chapterId, topicId]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Chapter name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const chapterData = {
        ...formData,
        topic: topicId,
        order: formData.order ? parseInt(formData.order) : undefined
      };

      if (isEdit) {
        await contentAPI.updateChapter(chapterId, chapterData);
        setSuccess('Chapter updated successfully!');
      } else {
        await contentAPI.createChapter(chapterData);
        setSuccess('Chapter created successfully!');
      }

      // Navigate back to topic page after a short delay
      setTimeout(() => {
        navigate(`/topic/${topicId}`);
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save chapter');
      console.error('Error saving chapter:', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Array field handlers
  const addArrayItem = (field, value, setter) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setter('');
    }
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEdit ? 'Edit Chapter' : 'Add New Chapter'}
              </h1>
              <p className="text-gray-600 mt-2">
                {topicData?.name && `for topic: ${topicData.name}`}
              </p>
            </div>
            <button
              onClick={() => navigate(`/topic/${topicId}`)}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X size={20} className="mr-2" />
              Cancel
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <BookOpen size={20} className="mr-2 text-blue-500" />
                Basic Information
              </h2>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Enter chapter name"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Describe what this chapter covers"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="">Select difficulty</option>
                  {difficultyOptions.map(option => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estimated Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => handleInputChange('estimatedTime', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="e.g., 30"
                  min="1"
                />
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="e.g., 1"
                  min="1"
                />
              </div>
            </div>

            {/* Content and Objectives */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Target size={20} className="mr-2 text-green-500" />
                Content & Objectives
              </h2>

              {/* Content Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Types
                </label>
                <div className="space-y-3">
                  {/* Predefined options */}
                  <div className="flex flex-wrap gap-2">
                    {contentTypeOptions.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          if (!formData.contentTypes.includes(type)) {
                            handleInputChange('contentTypes', [...formData.contentTypes, type]);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          formData.contentTypes.includes(type)
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom content type */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newContentType}
                      onChange={(e) => setNewContentType(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="Add custom content type"
                    />
                    <button
                      type="button"
                      onClick={() => addArrayItem('contentTypes', newContentType, setNewContentType)}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  {/* Selected content types */}
                  {formData.contentTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.contentTypes.map((type, index) => (
                        <span
                          key={index}
                          className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {type}
                          <button
                            type="button"
                            onClick={() => removeArrayItem('contentTypes', index)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Learning Objectives */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Objectives
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLearningObjective}
                      onChange={(e) => setNewLearningObjective(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="Add learning objective"
                    />
                    <button
                      type="button"
                      onClick={() => addArrayItem('learningObjectives', newLearningObjective, setNewLearningObjective)}
                      className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  {formData.learningObjectives.length > 0 && (
                    <div className="space-y-2">
                      {formData.learningObjectives.map((objective, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <span className="text-green-800">{objective}</span>
                          <button
                            type="button"
                            onClick={() => removeArrayItem('learningObjectives', index)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Prerequisites */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prerequisites
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPrerequisite}
                      onChange={(e) => setNewPrerequisite(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="Add prerequisite"
                    />
                    <button
                      type="button"
                      onClick={() => addArrayItem('prerequisites', newPrerequisite, setNewPrerequisite)}
                      className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  {formData.prerequisites.length > 0 && (
                    <div className="space-y-2">
                      {formData.prerequisites.map((prereq, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
                        >
                          <span className="text-orange-800">{prereq}</span>
                          <button
                            type="button"
                            onClick={() => removeArrayItem('prerequisites', index)}
                            className="text-orange-600 hover:text-orange-800"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(`/topic/${topicId}`)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    {isEdit ? 'Update Chapter' : 'Create Chapter'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChapterFormPage; 