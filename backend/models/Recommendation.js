const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User' },
  topicId: { type: String, ref: 'Topic' },
  topic: { type: String },
  subject: { type: String, ref: 'Subject' },
  reason: { type: String },
  confidence: { type: Number },
  difficulty: { type: String },
  estimatedTime: { type: String },
  contentTypes: [{ type: String }],
  priority: { type: Number },
  createdAt: { type: Date },
  used: { type: Boolean, default: false },
  feedback: { type: String }
});

module.exports = mongoose.model('Recommendation', RecommendationSchema); 