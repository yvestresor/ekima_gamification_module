import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  ChevronDown,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

const Login = () => {
  const { login, register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Clear any auth errors when login page mounts
  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setSuccessMessage(null);
    // Failsafe: stop spinner if request hangs
    let watchdog;
    const stopSubmitting = () => {
      if (watchdog) clearTimeout(watchdog);
      setSubmitting(false);
    };
    watchdog = setTimeout(() => {
      setFormError('Login is taking longer than expected. Please check your connection and try again.');
      setSubmitting(false);
    }, 10000);
    if (mode === 'login') {
      const { email, password } = form;
      if (!email || !password) {
        setFormError('Please enter both email and password.');
        setSubmitting(false);
        return;
      }
      const result = await login({ email, password });
      if (result.success) {
        if (watchdog) clearTimeout(watchdog);
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
        setSuccessMessage('Account created! Please sign in.');
        setForm({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
      } else {
        setFormError(result.error || 'Registration failed.');
      }
    }
    stopSubmitting();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-purple-50 p-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-orange-600 to-yellow-600 p-6 text-center text-white">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            {mode === 'login' ? (
              <LogIn className="w-8 h-8" />
            ) : (
              <UserPlus className="w-8 h-8" />
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {mode === 'login' ? 'Welcome Back!' : 'Join Ekima'}
          </h2>
          <p className="text-orange-100 text-sm">
            {mode === 'login' 
              ? 'Sign in to continue your learning journey' 
              : 'Create your account to start learning'}
          </p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500"
                  placeholder="Enter your full name"
                  required
                  autoFocus
                />
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="w-4 h-4 inline mr-2" />
                  User Role
                </label>
                <div className="relative">
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 appearance-none bg-white"
                    required
                  >
                    <option value="student">🎓 Student</option>
                    <option value="teacher">👩‍🏫 Teacher</option>
                    <option value="admin">⚡ Administrator</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500"
                placeholder="Enter your email address"
                required
                autoFocus={mode === 'login'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Error and Success Messages */}
            {(formError || (error && error !== 'No token found')) && (
              <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{formError || error}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{successMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 text-white py-3 px-4 rounded-lg hover:from-orange-700 hover:to-yellow-700 transition-all duration-200 font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
              disabled={submitting || isLoading}
            >
              {submitting || isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  {mode === 'login' ? (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Sign In</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Create Account</span>
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Mode Toggle */}
          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {mode === 'login' ? 'New to Ekima?' : 'Already have an account?'}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="mt-4 w-full text-orange-600 hover:text-orange-700 font-medium py-2 px-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
              onClick={() => { 
                setMode(mode === 'login' ? 'register' : 'login'); 
                setFormError(null); 
                setSuccessMessage(null);
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
            >
              {mode === 'login' ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            By {mode === 'login' ? 'signing in' : 'creating an account'}, you agree to our{' '}
            <a href="#" className="text-orange-600 hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-orange-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
