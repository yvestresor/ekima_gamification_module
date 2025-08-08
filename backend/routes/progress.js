const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const progressController = require('../controllers/progressController');

// Create or update progress
router.post('/', auth(), progressController.createOrUpdateProgress);
// Get all progress for a user
router.get('/:userId', auth(), progressController.getUserProgress);
// Get a specific progress item by ID
router.get('/item/:id', auth(), progressController.getProgressById);
// Delete a progress item
router.delete('/item/:id', auth(), progressController.deleteProgress);

module.exports = router;
