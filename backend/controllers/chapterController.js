const Chapter = require('../models/Chapter');
const Topic = require('../models/Topic');

exports.getAllChapters = async (req, res) => {
  try {
    const chapters = await Chapter.find().populate('topic', 'name');
    res.json(chapters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getChapterById = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id).populate('topic', 'name');
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    res.json(chapter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createChapter = async (req, res) => {
  try {
    const chapter = new Chapter(req.body);
    await chapter.save();
    
    // Add chapter to topic's chapters array
    if (chapter.topic) {
      await Topic.findByIdAndUpdate(
        chapter.topic,
        { $push: { chapters: chapter._id } },
        { new: true }
      );
    }
    
    // Populate the topic field before sending response
    await chapter.populate('topic', 'name');
    res.status(201).json(chapter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('topic', 'name');
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    res.json(chapter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    
    // Remove chapter from topic's chapters array
    if (chapter.topic) {
      await Topic.findByIdAndUpdate(
        chapter.topic,
        { $pull: { chapters: chapter._id } },
        { new: true }
      );
    }
    
    await Chapter.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chapter deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 