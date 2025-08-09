import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = 30000;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ================= USER API =================
export const userAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data) => apiClient.put('/users/profile', data),
  getAll: () => apiClient.get('/users'),
  getById: (id) => apiClient.get(`/users/${id}`),
  create: (data) => apiClient.post('/users', data),
  update: (id, data) => apiClient.put(`/users/${id}`, data),
  delete: (id) => apiClient.delete(`/users/${id}`),
};

// =============== SUBJECT/TOPIC/CHAPTER ===============
export const contentAPI = {
  // Subjects
  getSubjects: () => apiClient.get('/subject'),
  getSubject: (id) => apiClient.get(`/subject/${id}`),
  createSubject: (data) => apiClient.post('/subject', data),
  updateSubject: (id, data) => apiClient.put(`/subject/${id}`, data),
  deleteSubject: (id) => apiClient.delete(`/subject/${id}`),
  // Topics
  getTopics: () => apiClient.get('/topic'),
  getTopic: (id) => apiClient.get(`/topic/${id}`),
  createTopic: (data) => apiClient.post('/topic', data),
  updateTopic: (id, data) => apiClient.put(`/topic/${id}`, data),
  deleteTopic: (id) => apiClient.delete(`/topic/${id}`),
  // Chapters
  getChapters: () => apiClient.get('/chapter'),
  getChapter: (id) => apiClient.get(`/chapter/${id}`),
  createChapter: (data) => apiClient.post('/chapter', data),
  updateChapter: (id, data) => apiClient.put(`/chapter/${id}`, data),
  deleteChapter: (id) => apiClient.delete(`/chapter/${id}`),
};

// =============== PROGRESS ===============
export const progressAPI = {
  getUserProgress: (userId) => apiClient.get(`/progress/${userId}`),
  createOrUpdate: (data) => apiClient.post('/progress', data),
};

// =============== QUIZ ATTEMPT ===============
export const quizAttemptAPI = {
  getByUser: (userId) => apiClient.get(`/quizattempt/user/${userId}`),
  getAll: () => apiClient.get('/quizattempt'),
  create: (data) => apiClient.post('/quizattempt', data),
};

// =============== BADGES (ACHIEVEMENTS) ===============
export const badgeAPI = {
  getAll: () => apiClient.get('/badge'),
  getById: (id) => apiClient.get(`/badge/${id}`),
  create: (data) => apiClient.post('/badge', data),
  update: (id, data) => apiClient.put(`/badge/${id}`, data),
  delete: (id) => apiClient.delete(`/badge/${id}`),
};

// =============== RECOMMENDATIONS ===============
export const recommendationAPI = {
  getAll: () => apiClient.get('/recommendation'),
  getById: (id) => apiClient.get(`/recommendation/${id}`),
  create: (data) => apiClient.post('/recommendation', data),
  update: (id, data) => apiClient.put(`/recommendation/${id}`, data),
  delete: (id) => apiClient.delete(`/recommendation/${id}`),
};

// =============== EXPERIMENTS ===============
export const experimentAPI = {
  getAll: () => apiClient.get('/experiment'),
  getById: (id) => apiClient.get(`/experiment/${id}`),
  create: (data) => apiClient.post('/experiment', data),
  update: (id, data) => apiClient.put(`/experiment/${id}`, data),
  delete: (id) => apiClient.delete(`/experiment/${id}`),
};

// =============== SIMULATIONS ===============
export const simulationAPI = {
  getAll: () => apiClient.get('/simulation'),
  getById: (id) => apiClient.get(`/simulation/${id}`),
  create: (data) => apiClient.post('/simulation', data),
  update: (id, data) => apiClient.put(`/simulation/${id}`, data),
  delete: (id) => apiClient.delete(`/simulation/${id}`),
};

// =============== 3D MODELS ===============
export const model3dAPI = {
  getAll: () => apiClient.get('/model3d'),
  getById: (id) => apiClient.get(`/model3d/${id}`),
  create: (data) => apiClient.post('/model3d', data),
  update: (id, data) => apiClient.put(`/model3d/${id}`, data),
  delete: (id) => apiClient.delete(`/model3d/${id}`),
};

// =============== VIDEOS ===============
export const videoAPI = {
  getAll: () => apiClient.get('/video'),
  getById: (id) => apiClient.get(`/video/${id}`),
  create: (data) => apiClient.post('/video', data),
  update: (id, data) => apiClient.put(`/video/${id}`, data),
  delete: (id) => apiClient.delete(`/video/${id}`),
};

// =============== QUESTIONS ===============
export const questionAPI = {
  getAll: () => apiClient.get('/question'),
  getById: (id) => apiClient.get(`/question/${id}`),
  create: (data) => apiClient.post('/question', data),
  update: (id, data) => apiClient.put(`/question/${id}`, data),
  delete: (id) => apiClient.delete(`/question/${id}`),
};

// =============== NOTIFICATIONS ===============
export const notificationAPI = {
  getAll: (params) => apiClient.get('/notifications', { 
    params, 
    timeout: 5000 // Shorter timeout for notifications to prevent hanging
  }),
  getById: (id) => apiClient.get(`/notifications/${id}`),
  create: (data) => apiClient.post('/notifications', data),
  createBulk: (data) => apiClient.post('/notifications/bulk', data),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
  delete: (id) => apiClient.delete(`/notifications/${id}`),
};

// =============== AUTH ===============
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),
};

// =============== UTILS ===============
export { apiClient };