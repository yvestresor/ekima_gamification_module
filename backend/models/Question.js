const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  subject: { type: String, ref: 'Subject' },
  topic: { type: String, ref: 'Topic' },
  chapter: { type: String, ref: 'Chapter' },
  difficulty: { type: String },
  type: { type: String },
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: Number },
  explanation: { type: String },
  hint: { type: String },
  points: { type: Number },
  timeLimit: { type: Number }
});

module.exports = mongoose.model('Question', QuestionSchema); 