const Topic = require('../models/Topic');

exports.getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find();
    res.json(topics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).populate('chapters');
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    res.json(topic);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTopic = async (req, res) => {
  try {
    const topic = new Topic(req.body);
    await topic.save();
    // Add topic to subject's topics array
    if (topic.subject) {
      const Subject = require('../models/Subject');
      await Subject.findByIdAndUpdate(
        topic.subject,
        { $addToSet: { topics: topic._id } }
      );
    }
    res.status(201).json(topic);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    res.json(topic);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndDelete(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    res.json({ message: 'Topic deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 