const express = require('express');
const router = express.Router();
const quizAttemptController = require('../controllers/quizAttemptController');

router.get('/user/:id', quizAttemptController.getQuizAttemptByUser)
router.get('/', quizAttemptController.getAllQuizAttempts);
router.post('/', quizAttemptController.createQuizAttempt);
router.get('/:id', quizAttemptController.getQuizAttemptById);
router.put('/:id', quizAttemptController.updateQuizAttempt);
router.delete('/:id', quizAttemptController.deleteQuizAttempt);

module.exports = router; 