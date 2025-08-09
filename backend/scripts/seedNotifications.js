require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');

const sampleNotifications = [
  {
    type: 'achievement',
    title: 'New Achievement Unlocked!',
    message: 'Congratulations! You\'ve earned the "Week Warrior" badge for maintaining a 7-day learning streak.',
    icon: '🏆',
    priority: 'high'
  },
  {
    type: 'recommendation',
    title: 'New Topic Recommended',
    message: 'Based on your progress, we recommend starting "Linear Equations" - it\'s perfect for your current level.',
    icon: '💡',
    priority: 'medium'
  },
  {
    type: 'streak',
    title: 'Streak Reminder',
    message: 'Keep your 7-day learning streak alive! Complete a lesson today to maintain your momentum.',
    icon: '🔥',
    priority: 'medium'
  },
  {
    type: 'progress',
    title: 'Great Progress!',
    message: 'You\'ve completed 75% of the Mathematics module. Keep up the excellent work!',
    icon: '📈',
    priority: 'low'
  },
  {
    type: 'quiz',
    title: 'Quiz Available',
    message: 'A new practice quiz for "Algebra Basics" is now available. Test your knowledge!',
    icon: '📝',
    priority: 'medium'
  },
  {
    type: 'general',
    title: 'Welcome to Ekima!',
    message: 'Welcome to your personalized learning journey. Explore subjects, track progress, and earn achievements as you learn.',
    icon: '🎉',
    priority: 'low'
  }
];

async function seedNotifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find();
    
    if (users.length === 0) {
      console.log('No users found. Please create some users first.');
      process.exit(1);
    }

    console.log(`Found ${users.length} users`);

    // Clear existing notifications
    await Notification.deleteMany({});
    console.log('Cleared existing notifications');

    // Create notifications for each user
    const notifications = [];
    
    for (const user of users) {
      // Create 3-4 random notifications per user
      const userNotifications = sampleNotifications
        .sort(() => 0.5 - Math.random()) // Shuffle
        .slice(0, Math.floor(Math.random() * 2) + 3) // Take 3-4 random notifications
        .map(notif => ({
          ...notif,
          user: user._id,
          read: Math.random() > 0.6, // 40% chance of being read
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time within last week
        }));

      notifications.push(...userNotifications);
    }

    // Insert notifications
    const created = await Notification.insertMany(notifications);
    console.log(`Created ${created.length} notifications`);

    // Create some read notifications
    const readNotifications = await Notification.find({ read: true });
    for (const notification of readNotifications) {
      notification.readAt = new Date(notification.createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000);
      await notification.save();
    }

    console.log('✅ Notification seeding completed successfully');
    
  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedNotifications();
