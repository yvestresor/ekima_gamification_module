const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, ref: 'Subject' },
  topic: { type: String, ref: 'Topic' },
  difficulty: { type: String },
  // store duration in seconds (frontend formats)
  duration: { type: Number, default: 0 },
  description: { type: String },
  thumbnail: { type: String },
  videoUrl: { type: String, required: true },
  tags: [{ type: String }],
  instructor: { type: String },
  instructorAvatar: { type: String },
  uploadDate: { type: Date },
  viewCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  xpReward: { type: Number, default: 10 },
  hasTranscript: { type: Boolean, default: false },
  hasQuiz: { type: Boolean, default: false },
  chapters: [{ title: String, time: Number }],
  relatedMaterials: [{ type: String }],
  captions: [{ start: Number, end: Number, text: String }]
});

module.exports = mongoose.model('Video', VideoSchema); 