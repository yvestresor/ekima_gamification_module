const Progress = require('../models/Progress');

// Get all progress for a user
exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?._id;
    if (!userId) return res.status(400).json({ message: 'User ID required' });
    const progress = await Progress.find({ userId });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a specific progress item by ID
exports.getProgressById = async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id);
    if (!progress) return res.status(404).json({ message: 'Progress not found' });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create or update progress (upsert)
exports.createOrUpdateProgress = async (req, res) => {
  try {
    const { userId, chapterId, ...rest } = req.body;
    if (!userId || !chapterId) return res.status(400).json({ message: 'userId and chapterId required' });
    const progress = await Progress.findOneAndUpdate(
      { userId, chapterId },
      { $set: { ...rest } },
      { new: true, upsert: true }
    );
    res.status(201).json(progress);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a progress item
exports.deleteProgress = async (req, res) => {
  try {
    const progress = await Progress.findByIdAndDelete(req.params.id);
    if (!progress) return res.status(404).json({ message: 'Progress not found' });
    res.json({ message: 'Progress deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
