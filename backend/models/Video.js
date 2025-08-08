const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, ref: 'Subject' },
  topic: { type: String, ref: 'Topic' },
  difficulty: { type: String },
  duration: { type: Number },
  description: { type: String },
  thumbnail: { type: String },
  videoUrl: { type: String },
  tags: [{ type: String }],
  instructor: { type: String },
  instructorAvatar: { type: String },
  uploadDate: { type: Date },
  viewCount: { type: Number },
  rating: { type: Number },
  likes: { type: Number },
  dislikes: { type: Number },
  xpReward: { type: Number },
  hasTranscript: { type: Boolean, default: false },
  hasQuiz: { type: Boolean, default: false },
  chapters: [{ title: String, time: Number }],
  relatedMaterials: [{ type: String }],
  captions: [{ start: Number, end: Number, text: String }]
});

module.exports = mongoose.model('Video', VideoSchema); 