const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

// Get user's notifications
router.get('/', notificationController.getUserNotifications);

// Get specific notification
router.get('/:id', notificationController.getNotificationById);

// Create notification (admin only)
router.post('/', notificationController.createNotification);

// Create bulk notifications (admin only)
router.post('/bulk', notificationController.createBulkNotifications);

// Mark notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
