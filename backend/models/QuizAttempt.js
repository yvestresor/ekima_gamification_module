const mongoose = require('mongoose');

const QuizAttemptSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User' },
  chapterId: { type: String, ref: 'Chapter' },
  questionId: { type: String, ref: 'Question' },
  score: { type: Number },
  totalQuestions: { type: Number },
  correctAnswers: { type: Number },
  timeSpent: { type: Number },
  createdAt: { type: Date },
  difficulty: { type: String },
  topic: { type: String, ref: 'Topic' },
  subject: { type: String, ref: 'Subject' }
});

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema); 