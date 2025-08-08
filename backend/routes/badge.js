const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');

router.get('/', badgeController.getAllBadges);
router.post('/', badgeController.createBadge);
router.get('/:id', badgeController.getBadgeById);
router.put('/:id', badgeController.updateBadge);
router.delete('/:id', badgeController.deleteBadge);

module.exports = router; 