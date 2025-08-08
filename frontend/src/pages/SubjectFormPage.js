import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { contentAPI } from '../services/api';

const defaultForm = {
  name: '', code: '', description: '', thumbnail: '', icon: '', color: '', bgGradient: '',
  difficulty_level: 'beginner', estimated_duration: '', syllabus: '', education_level: '',
  level: '', prerequisites: [], learning_outcomes: [], topics: [], content_types: [], skills_developed: []
};

const SubjectFormPage = ({ mode }) => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if ((mode === 'edit' || subjectId) && subjectId) {
      setLoading(true);
      contentAPI.getSubject(subjectId).then(res => {
        setForm({ ...defaultForm, ...res.data });
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [mode, subjectId]);

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleArrayChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value.split(',').map(s => s.trim()).filter(Boolean) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'add') {
        await contentAPI.createSubject(form);
      } else {
        await contentAPI.updateSubject(subjectId, form);
      }
      navigate('/subjects');
    } catch (err) {
      setError('Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-black">{mode === 'add' ? 'Add Subject' : 'Edit Subject'}</h1>
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
            <label className="block text-gray-700 mb-1">Code</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.code} onChange={e => handleChange('code', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Description</label>
            <textarea className="w-full border rounded px-3 py-2 text-black" value={form.description} onChange={e => handleChange('description', e.target.value)} required />
          </div>
        </div>
        {/* Visuals */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-black">Visuals</h2>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Thumbnail URL</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.thumbnail} onChange={e => handleChange('thumbnail', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Icon</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.icon} onChange={e => handleChange('icon', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Color</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.color} onChange={e => handleChange('color', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Background Gradient</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.bgGradient} onChange={e => handleChange('bgGradient', e.target.value)} />
          </div>
        </div>
        {/* Curriculum & Structure */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-black">Curriculum & Structure</h2>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Difficulty Level</label>
            <select className="w-full border rounded px-3 py-2 text-black" value={form.difficulty_level} onChange={e => handleChange('difficulty_level', e.target.value)}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Estimated Duration (hours)</label>
            <input type="number" className="w-full border rounded px-3 py-2 text-black" value={form.estimated_duration} onChange={e => handleChange('estimated_duration', e.target.value)} min="1" />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Syllabus</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.syllabus} onChange={e => handleChange('syllabus', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Education Level</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.education_level} onChange={e => handleChange('education_level', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Level</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.level} onChange={e => handleChange('level', e.target.value)} />
          </div>
        </div>
        {/* Arrays & Advanced */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-black">Advanced</h2>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Prerequisites (comma separated)</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.prerequisites.join(', ')} onChange={e => handleArrayChange('prerequisites', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Learning Outcomes (comma separated)</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.learning_outcomes.join(', ')} onChange={e => handleArrayChange('learning_outcomes', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Topics (comma separated IDs)</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.topics.join(', ')} onChange={e => handleArrayChange('topics', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Content Types (multi-select)</label>
            <select multiple className="w-full border rounded px-3 py-2 text-black" value={form.content_types} onChange={e => handleChange('content_types', Array.from(e.target.selectedOptions, option => option.value))}>
              <option value="videos">Videos</option>
              <option value="experiments">Experiments</option>
              <option value="simulations">Simulations</option>
              <option value="readings">Readings</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Skills Developed (comma separated)</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-black" value={form.skills_developed.join(', ')} onChange={e => handleArrayChange('skills_developed', e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => navigate('/subjects')}>Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>{mode === 'add' ? 'Add' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
};

export default SubjectFormPage; 