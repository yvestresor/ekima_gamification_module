const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');

router.get('/', chapterController.getAllChapters);
router.post('/', chapterController.createChapter);
router.get('/:id', chapterController.getChapterById);
router.put('/:id', chapterController.updateChapter);
router.delete('/:id', chapterController.deleteChapter);

module.exports = router; 