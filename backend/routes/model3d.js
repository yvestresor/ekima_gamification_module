const express = require('express');
const router = express.Router();
const model3DController = require('../controllers/model3DController');

router.get('/', model3DController.getAllModels3D);
router.post('/', model3DController.createModel3D);
router.get('/:id', model3DController.getModel3DById);
router.put('/:id', model3DController.updateModel3D);
router.delete('/:id', model3DController.deleteModel3D);

module.exports = router; 