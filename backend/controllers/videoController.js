const Video = require('../models/Video');

// Helpers for metadata
const extractYouTubeId = (url = '') => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/);
  return match && match[1] ? match[1] : null;
};

const parseISODurationToSeconds = (iso = '') => {
  // ISO 8601 e.g., PT1H2M10S
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const hours = parseInt(m[1] || '0', 10);
  const minutes = parseInt(m[2] || '0', 10);
  const seconds = parseInt(m[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
};

// GET /api/video/metadata?url=...
exports.getVideoMetadata = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ message: 'url is required' });

    const youTubeId = extractYouTubeId(url);
    if (!youTubeId) {
      return res.json({
        provider: 'generic',
        title: null,
        thumbnail: null,
        durationSeconds: null,
      });
    }

    // Always attempt oEmbed (no key required) for title/thumbnail
    let title = null;
    let thumbnail = null;
    try {
      const oembedResp = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      if (oembedResp.ok) {
        const data = await oembedResp.json();
        title = data.title || null;
        thumbnail = data.thumbnail_url || null;
      }
    } catch (_) {}

    // If API key available, fetch duration
    let durationSeconds = null;
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (apiKey) {
      try {
        const apiResp = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${youTubeId}&key=${apiKey}`);
        if (apiResp.ok) {
          const data = await apiResp.json();
          const iso = data?.items?.[0]?.contentDetails?.duration;
          if (iso) durationSeconds = parseISODurationToSeconds(iso);
        }
      } catch (_) {}
    }

    return res.json({
      provider: 'youtube',
      id: youTubeId,
      title,
      thumbnail,
      durationSeconds,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find();
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createVideo = async (req, res) => {
  try {
    const video = new Video(req.body);
    await video.save();
    res.status(201).json(video);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json(video);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json({ message: 'Video deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 