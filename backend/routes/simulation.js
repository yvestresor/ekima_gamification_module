const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');

router.get('/', simulationController.getAllSimulations);
router.post('/', simulationController.createSimulation);
router.get('/:id', simulationController.getSimulationById);
router.put('/:id', simulationController.updateSimulation);
router.delete('/:id', simulationController.deleteSimulation);

module.exports = router; 