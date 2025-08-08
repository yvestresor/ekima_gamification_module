const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  difficulty: { type: String },
  estimatedTime: { type: String },
  order: { type: Number },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  contentTypes: [{ type: String }],
  learningObjectives: [{ type: String }],
  prerequisites: [{ type: String }]
});

module.exports = mongoose.model('Chapter', ChapterSchema); 