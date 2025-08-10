const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

router.get('/profile', auth(), userController.getProfile);
router.put('/profile', auth(), userController.updateMyProfile);
router.post('/activity/daily', auth(), userController.recordDailyActivity);
router.post('/login/record', auth(), userController.recordLogin);
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router; 