import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, register, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    if (mode === 'login') {
      const { email, password } = form;
      if (!email || !password) {
        setFormError('Please enter both email and password.');
        setSubmitting(false);
        return;
      }
      const result = await login({ email, password });
      if (result.success) {
        navigate('/');
      } else {
        setFormError(result.error || 'Login failed.');
      }
    } else {
      // Register mode
      const { name, email, password, confirmPassword, role } = form;
      if (!name || !email || !password || !confirmPassword) {
        setFormError('Please fill in all fields.');
        setSubmitting(false);
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match.');
        setSubmitting(false);
        return;
      }
      const result = await register({ username: name, email, password, role });
      if (result.success) {
        setMode('login');
        setFormError('Account created! Please sign in.');
        setForm({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
      } else {
        setFormError(result.error || 'Registration failed.');
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-black text-center text-blue-700">
          {mode === 'login' ? 'Sign In to Your Account' : 'Create Your Account'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                required
                autoFocus
              />
            </div>
          )}
          {mode === 'register' && (
            <div>
              <label className="block text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                required
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              required
              autoFocus={mode === 'login'}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              required
            />
          </div>
          {mode === 'register' && (
            <div>
              <label className="block text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                required
              />
            </div>
          )}
          {(formError || error) && (
            <div className="text-red-600 text-sm text-center">{formError || error}</div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-60"
            disabled={submitting || isLoading}
          >
            {submitting || isLoading
              ? mode === 'login' ? 'Signing in...' : 'Creating account...'
              : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <div className="mt-4 text-center">
          {mode === 'login' ? (
            <span>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                className="text-blue-600 hover:underline font-medium"
                onClick={() => { setMode('register'); setFormError(null); }}
              >
                Create Account
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                className="text-blue-600 hover:underline font-medium"
                onClick={() => { setMode('login'); setFormError(null); }}
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
