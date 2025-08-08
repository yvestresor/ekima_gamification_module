const express = require('express');
const router = express.Router();
const experimentController = require('../controllers/experimentController');

router.get('/', experimentController.getAllExperiments);
router.post('/', experimentController.createExperiment);
router.get('/:id', experimentController.getExperimentById);
router.put('/:id', experimentController.updateExperiment);
router.delete('/:id', experimentController.deleteExperiment);

module.exports = router; 