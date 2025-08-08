const Experiment = require('../models/Experiment');

exports.getAllExperiments = async (req, res) => {
  try {
    const experiments = await Experiment.find();
    res.json(experiments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getExperimentById = async (req, res) => {
  try {
    const experiment = await Experiment.findById(req.params.id);
    if (!experiment) return res.status(404).json({ message: 'Experiment not found' });
    res.json(experiment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createExperiment = async (req, res) => {
  try {
    const experiment = new Experiment(req.body);
    await experiment.save();
    res.status(201).json(experiment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateExperiment = async (req, res) => {
  try {
    const experiment = await Experiment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!experiment) return res.status(404).json({ message: 'Experiment not found' });
    res.json(experiment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteExperiment = async (req, res) => {
  try {
    const experiment = await Experiment.findByIdAndDelete(req.params.id);
    if (!experiment) return res.status(404).json({ message: 'Experiment not found' });
    res.json({ message: 'Experiment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 