const QuizAttempt = require('../models/QuizAttempt');

exports.getAllQuizAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find();
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getQuizAttemptByUser = async (req, res) => {
  try {
    // Return all quiz attempts for a given user
    const attempts = await QuizAttempt.find({ userId: req.params.id });
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getQuizAttemptById = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ message: 'QuizAttempt not found' });
    res.json(attempt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createQuizAttempt = async (req, res) => {
  try {
    const attempt = new QuizAttempt(req.body);
    await attempt.save();
    res.status(201).json(attempt);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateQuizAttempt = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!attempt) return res.status(404).json({ message: 'QuizAttempt not found' });
    res.json(attempt);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteQuizAttempt = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findByIdAndDelete(req.params.id);
    if (!attempt) return res.status(404).json({ message: 'QuizAttempt not found' });
    res.json({ message: 'QuizAttempt deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 