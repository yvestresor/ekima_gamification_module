const User = require('../models/User');

// Helper: safely pick allowed profile fields from body
const pickProfileFields = (body) => ({
  name: body.name,
  profilePic: body.profilePic || body.avatar,
  bio: body.bio,
  location: body.location,
  school: body.school,
  level: body.level,
  grade: body.grade,
  ageGroup: body.ageGroup,
  gender: body.gender,
  region: body.region,
  district: body.district,
  interests: Array.isArray(body.interests) ? body.interests : undefined,
  preferences: body.preferences,
});

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // Assume req.user is set by authentication middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    // Optionally, fetch fresh user data from DB
    const user = await User.findById(req.user._id || req.user.id)
      .select('-password')
      .populate('badges');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 

// Update current user's profile
exports.updateMyProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

    const updates = pickProfileFields(req.body);
    // Remove undefined to avoid wiping fields unintentionally
    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

    const user = await User.findByIdAndUpdate(
      req.user._id || req.user.id,
      { $set: updates },
      { new: true }
    ).select('-password').populate('badges');

    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// Record daily activity (increment or reset streak as needed)
exports.recordDailyActivity = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

    const user = await User.findById(req.user._id || req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.recordDailyActivity(new Date());
    await user.save();
    return res.json({
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastStreakDate: user.lastStreakDate,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Record login (sets lastLoginAt, joinedAt default)
exports.recordLogin = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.recordLogin();
    await user.save();
    return res.json({ lastLoginAt: user.lastLoginAt, joinedAt: user.joinedAt });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};