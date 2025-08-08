import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { contentAPI } from '../services/api';

const defaultForm = {
  name: '',
  subject: '',
  level: '',
  educationLevel: '',
  syllabus: '',
  isFeatured: false,
  descriptions: '',
  viewedBy: [],
  language: '',
  difficulty: '',
  estimatedTime: '',
  prerequisites: [],
  learning_objectives: [],
  chapters: []
};

const TopicFormPage = ({ mode }) => {
  const { topicId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If adding, allow passing subjectId via query param
  useEffect(() => {
    if ((mode === 'edit' || topicId) && topicId) {
      setLoading(true);
      contentAPI.getTopic(topicId).then(res => {
        setForm({ ...defaultForm, ...res.data });
        setLoading(false);
      }).catch(() => setLoading(false));
    } else if (mode === 'add') {
      const params = new URLSearchParams(location.search);
      const subjectId = params.get('subject');
      if (subjectId) setForm(f => ({ ...f, subject: subjectId }));
    }
  }, [mode, topicId, location.search]);

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleArrayChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value.split(',').map(s => s.trim()).filter(Boolean) }));
  };

  const handleCheckbox = (field, checked) => {
    setForm(f => ({ ...f, [field]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'add') {
        await contentAPI.createTopic(form);
      } else {
        await contentAPI.updateTopic(topicId, form);
      }
      navigate(`/subject/${form.subject}`);
    } catch (err) {
      setError('Failed to save topic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-black">{mode === 'add' ? 'Add Topic' : 'Edit Topic'}</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-black">Basic Information</h2>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Name</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.name} onChange={e => handleChange('name', e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Subject ID</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.subject} onChange={e => handleChange('subject', e.target.value)} required />
          </div>
        </div>
        {/* Details */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-black">Details</h2>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Level</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.level} onChange={e => handleChange('level', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Education Level</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.educationLevel} onChange={e => handleChange('educationLevel', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Syllabus</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.syllabus} onChange={e => handleChange('syllabus', e.target.value)} />
          </div>
          <div className="mb-3 flex items-center gap-2">
            <input type="checkbox" id="isFeatured" checked={form.isFeatured} onChange={e => handleCheckbox('isFeatured', e.target.checked)} />
            <label htmlFor="isFeatured" className="text-gray-700">Featured Topic</label>
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Descriptions</label>
            <textarea className="w-full border rounded px-3 py-2 text-black" value={form.descriptions} onChange={e => handleChange('descriptions', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Language</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.language} onChange={e => handleChange('language', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Difficulty</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.difficulty} onChange={e => handleChange('difficulty', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Estimated Time</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.estimatedTime} onChange={e => handleChange('estimatedTime', e.target.value)} />
          </div>
        </div>
        {/* Arrays */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-black">Advanced</h2>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Prerequisites (comma separated)</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.prerequisites.join(', ')} onChange={e => handleArrayChange('prerequisites', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Learning Objectives (comma separated)</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.learning_objectives.join(', ')} onChange={e => handleArrayChange('learning_objectives', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Chapters (comma separated IDs)</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.chapters.join(', ')} onChange={e => handleArrayChange('chapters', e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => navigate(`/subject/${form.subject}`)}>Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>{mode === 'add' ? 'Add' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
};

export default TopicFormPage; 