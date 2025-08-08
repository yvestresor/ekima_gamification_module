const mongoose = require('mongoose');

const ExperimentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, ref: 'Subject' },
  topic: { type: String, ref: 'Topic' },
  difficulty: { type: String },
  duration: { type: Number },
  description: { type: String },
  thumbnail: { type: String },
  materials: [{ type: String }],
  safety: [{ type: String }],
  learningObjectives: [{ type: String }],
  steps: [{ type: String }],
  interactive: { type: Boolean, default: false },
  hasSimulation: { type: Boolean, default: false },
  rating: { type: Number },
  completions: { type: Number },
  createdAt: { type: Date, default: Date.now },
  tags: [{ type: String }],
  xpReward: { type: Number },
  equipment: [{ type: String }],
  parameters: { type: Object }
});

module.exports = mongoose.model('Experiment', ExperimentSchema); 