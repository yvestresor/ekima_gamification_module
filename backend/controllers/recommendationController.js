const Recommendation = require('../models/Recommendation');

exports.getAllRecommendations = async (req, res) => {
  try {
    const recommendations = await Recommendation.find();
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecommendationById = async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id);
    if (!recommendation) return res.status(404).json({ message: 'Recommendation not found' });
    res.json(recommendation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createRecommendation = async (req, res) => {
  try {
    const recommendation = new Recommendation(req.body);
    await recommendation.save();
    res.status(201).json(recommendation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateRecommendation = async (req, res) => {
  try {
    const recommendation = await Recommendation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!recommendation) return res.status(404).json({ message: 'Recommendation not found' });
    res.json(recommendation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteRecommendation = async (req, res) => {
  try {
    const recommendation = await Recommendation.findByIdAndDelete(req.params.id);
    if (!recommendation) return res.status(404).json({ message: 'Recommendation not found' });
    res.json({ message: 'Recommendation deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
