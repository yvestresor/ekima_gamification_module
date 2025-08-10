const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Core auth
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },

  // Profile
  name: { type: String, trim: true },
  role: { type: String, enum: ['student', 'admin', 'teacher'], default: 'student' },
  ageGroup: { type: String },
  gender: { type: String },
  region: { type: String },
  district: { type: String },
  school: { type: String },
  level: { type: String },
  grade: { type: String },
  bio: { type: String, maxlength: 1000 },
  location: { type: String },
  interests: [{ type: String }],
  deviceType: { type: String },
  profilePic: { type: String },

  // Preferences (for appearance/settings)
  preferences: {
    theme: { type: String, default: 'system' },
    colorScheme: { type: String, default: 'orange' },
    fontSize: { type: String, default: 'md' },
    highContrast: { type: Boolean, default: false },
    compactMode: { type: Boolean, default: false },
  },

  // Engagement & status
  status: { type: Number, default: 1 },
  joinedAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date },
  lastActiveAt: { type: Date },
  timeSpent: { type: Number, default: 0 }, // ms
  total_time_studied: { type: Number, default: 0 }, // ms

  // Streak tracking
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastStreakDate: { type: Date }, // last date activity was recorded for streaks

  // Gamification
  coins: { type: Number, default: 0 },
  gems: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level_number: { type: Number, default: 1 },
  achievements_unlocked: { type: Number, default: 0 },
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
}, { timestamps: true });

// Index for frequent lookups
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

// Helper: normalize to start-of-day
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Instance method: record a login event
UserSchema.methods.recordLogin = function recordLogin() {
  this.lastLoginAt = new Date();
  if (!this.joinedAt) this.joinedAt = new Date();
};

// Instance method: record activity and update streaks
UserSchema.methods.recordDailyActivity = function recordDailyActivity(activityDate = new Date()) {
  const today = startOfDay(activityDate);
  const last = this.lastStreakDate ? startOfDay(this.lastStreakDate) : null;

  // If never had streak before
  if (!last) {
    this.currentStreak = 1;
    this.longestStreak = Math.max(this.longestStreak || 0, this.currentStreak);
    this.lastStreakDate = today;
    this.lastActiveAt = new Date();
    return;
  }

  const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    // Already counted today; just bump activity time
    this.lastActiveAt = new Date();
    return;
  }
  if (diffDays === 1) {
    this.currentStreak += 1;
  } else if (diffDays > 1) {
    this.currentStreak = 1; // reset streak
  }
  this.longestStreak = Math.max(this.longestStreak || 0, this.currentStreak);
  this.lastStreakDate = today;
  this.lastActiveAt = new Date();
};

// Keep longestStreak consistent
UserSchema.pre('save', function ensureLongest(next) {
  if (typeof this.currentStreak === 'number') {
    this.longestStreak = Math.max(this.longestStreak || 0, this.currentStreak);
  }
  if (!this.joinedAt) this.joinedAt = new Date();
  next();
});

module.exports = mongoose.model('User', UserSchema); 