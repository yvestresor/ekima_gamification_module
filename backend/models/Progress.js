const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chapterId: { type: String },
  topicId: { type: String },
  subjectId: { type: String },
  videoProgress: { type: Number, default: 0 },
  notesProgress: { type: Number, default: 0 },
  experimentsAttempted: { type: Number, default: 0 },
  totalExperiments: { type: Number, default: 0 },
  overallProgress: { type: Number, default: 0 },
  assessmentScoreAverage: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  lastAccessedAt: { type: Date, default: null },
  timeSpent: { type: Number, default: 0 },
  interactionCount: { type: Number, default: 0 },
  contentTypePreference: { type: String },
  strugglingAreas: [{ type: String }],
  masteredConcepts: [{ type: String }],
  recommendationUsed: { type: Boolean, default: false },
  recommendationEffectiveness: { type: Number, default: null },
  completedTasks: [{
    taskId: String,
    completedAt: Date
  }],
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', ProgressSchema);
