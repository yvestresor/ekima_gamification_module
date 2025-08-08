const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  type: { type: String },
  requirement: { type: Number },
  subject: { type: String },
  xp_reward: { type: Number },
  gems_reward: { type: Number },
  rarity: { type: String },
  category: { type: String },
  conditions: { type: Object },
  unlocked: { type: Boolean, default: false },
  unlockedAt: { type: Date, default: null },
});

module.exports = mongoose.model('Badge', BadgeSchema); 