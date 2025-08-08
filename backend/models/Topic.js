const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, ref: 'Subject' },
  level: { type: String },
  educationLevel: { type: String },
  syllabus: { type: String },
  isFeatured: { type: Boolean, default: false },
  descriptions: { type: String },
  viewedBy: [{ type: String }],
  language: { type: String },
  difficulty: { type: String },
  estimatedTime: { type: String },
  prerequisites: [{ type: String }],
  learning_objectives: [{ type: String }],
  chapters: [{ type: String, ref: 'Chapter' }]
});

module.exports = mongoose.model('Topic', TopicSchema); 