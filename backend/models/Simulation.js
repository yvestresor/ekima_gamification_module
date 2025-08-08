const mongoose = require('mongoose');

const SimulationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, ref: 'Subject' },
  topic: { type: String, ref: 'Topic' },
  difficulty: { type: String },
  duration: { type: Number },
  type: { type: String },
  description: { type: String },
  thumbnail: { type: String },
  tags: [{ type: String }],
  instructor: { type: String },
  instructorAvatar: { type: String },
  uploadDate: { type: Date },
  usageCount: { type: Number },
  rating: { type: Number },
  likes: { type: Number },
  xpReward: { type: Number },
  hasDataExport: { type: Boolean, default: false },
  hasGraphing: { type: Boolean, default: false },
  isInteractive: { type: Boolean, default: false },
  parameters: { type: Object },
  objectives: [{ type: String }],
  instructions: [{ type: String }]
});

module.exports = mongoose.model('Simulation', SimulationSchema); 