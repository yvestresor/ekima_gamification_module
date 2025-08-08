const mongoose = require('mongoose');

const Model3DSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, ref: 'Subject' },
  topic: { type: String, ref: 'Topic' },
  difficulty: { type: String },
  description: { type: String },
  thumbnail: { type: String },
  modelUrl: { type: String },
  tags: [{ type: String }],
  duration: { type: Number },
  interactive: { type: Boolean, default: false },
  hasAnimation: { type: Boolean, default: false },
  hasLabels: { type: Boolean, default: false },
  downloadSize: { type: String },
  rating: { type: Number },
  viewCount: { type: Number },
  createdAt: { type: Date, default: Date.now },
  author: { type: String },
  learningObjectives: [{ type: String }],
  instructions: [{ type: String }]
});

module.exports = mongoose.model('Model3D', Model3DSchema); 