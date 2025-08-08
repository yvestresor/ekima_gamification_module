const Simulation = require('../models/Simulation');

exports.getAllSimulations = async (req, res) => {
  try {
    const simulations = await Simulation.find();
    res.json(simulations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSimulationById = async (req, res) => {
  try {
    const simulation = await Simulation.findById(req.params.id);
    if (!simulation) return res.status(404).json({ message: 'Simulation not found' });
    res.json(simulation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSimulation = async (req, res) => {
  try {
    const simulation = new Simulation(req.body);
    await simulation.save();
    res.status(201).json(simulation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateSimulation = async (req, res) => {
  try {
    const simulation = await Simulation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!simulation) return res.status(404).json({ message: 'Simulation not found' });
    res.json(simulation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteSimulation = async (req, res) => {
  try {
    const simulation = await Simulation.findByIdAndDelete(req.params.id);
    if (!simulation) return res.status(404).json({ message: 'Simulation not found' });
    res.json({ message: 'Simulation deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 