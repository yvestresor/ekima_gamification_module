const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Profile fields
  name: { type: String },
  type: { type: String }, // student, teacher, etc.
  role: { type: String }, // learner, admin, etc.
  ageGroup: { type: String },
  gender: { type: String },
  region: { type: String },
  district: { type: String },
  school: { type: String },
  level: { type: String }, // O-Level reference
  deviceType: { type: String },
  timeSpent: { type: Number, default: 0 },
  loginAt: { type: Date },
  status: { type: Number, default: 1 },
  profilePic: { type: String },
  joinedAt: { type: Date },
  coins: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level_number: { type: Number, default: 1 },
  total_time_studied: { type: Number, default: 0 },
  achievements_unlocked: { type: Number, default: 0 },
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
  gems: { type: Number, default: 0 },
  streak: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', UserSchema); 