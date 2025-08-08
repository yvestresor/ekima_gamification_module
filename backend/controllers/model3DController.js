const Model3D = require('../models/Model3D');

exports.getAllModels3D = async (req, res) => {
  try {
    const models = await Model3D.find();
    res.json(models);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getModel3DById = async (req, res) => {
  try {
    const model = await Model3D.findById(req.params.id);
    if (!model) return res.status(404).json({ message: 'Model3D not found' });
    res.json(model);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createModel3D = async (req, res) => {
  try {
    const model = new Model3D(req.body);
    await model.save();
    res.status(201).json(model);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateModel3D = async (req, res) => {
  try {
    const model = await Model3D.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!model) return res.status(404).json({ message: 'Model3D not found' });
    res.json(model);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteModel3D = async (req, res) => {
  try {
    const model = await Model3D.findByIdAndDelete(req.params.id);
    if (!model) return res.status(404).json({ message: 'Model3D not found' });
    res.json({ message: 'Model3D deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 