const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String },
  description: { type: String },
  thumbnail: { type: String },
  icon: { type: String },
  color: { type: String },
  bgGradient: { type: String },
  difficulty_level: { type: String },
  estimated_duration: { type: String },
  syllabus: { type: String },
  education_level: { type: String },
  level: { type: String },
  prerequisites: [{ type: String }],
  learning_outcomes: [{ type: String }],
  topics: [{ type: String, ref: 'Topic' }],
  content_types: [{ type: String }],
  skills_developed: [{ type: String }]
});

module.exports = mongoose.model('Subject', SubjectSchema); 