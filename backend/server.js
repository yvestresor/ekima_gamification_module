require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

const PORT = process.env.PORT || 5000;

const cors = require('cors');
const path = require('path');

// Allow requests from your frontend origin
app.use(cors({
  origin: 'http://localhost:3000',
  // origin: 'https://ekima-gamification-module.vercel.app', // Uncomment this line for production
  credentials: true // if you use cookies/sessions
}));

app.use(express.json());
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
// app.use('/api/gamification', require('./routes/gamification'));
app.use('/api/users', require('./routes/users'));
app.use('/api/subject', require('./routes/subject'));
app.use('/api/topic', require('./routes/topic'));
app.use('/api/chapter', require('./routes/chapter'));
app.use('/api/experiment', require('./routes/experiment'));
app.use('/api/simulation', require('./routes/simulation'));
app.use('/api/model3d', require('./routes/model3d'));
app.use('/api/video', require('./routes/video'));
app.use('/api/question', require('./routes/question'));
app.use('/api/quizattempt', require('./routes/quizattempt'));
app.use('/api/recommendation', require('./routes/recommendation'));
app.use('/api/badge', require('./routes/badge'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/notifications', require('./routes/notification'));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err)); 