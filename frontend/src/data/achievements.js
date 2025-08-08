// Achievement definitions for Ekima Learning Platform

export const achievements = [
    // ============================================================================
    // COMPLETION ACHIEVEMENTS
    // ============================================================================
    {
      _id: "ACH001",
      name: "First Steps",
      description: "Complete your first chapter",
      icon: "🚀",
      type: "completion",
      requirement: 1,
      subject: null,
      xp_reward: 25,
      gems_reward: 10,
      rarity: "common",
      category: "getting_started",
      conditions: {
        chapters_completed: 1
      }
    },
    {
      _id: "ACH002", 
      name: "Chapter Master",
      description: "Complete 5 chapters",
      icon: "📚",
      type: "completion",
      requirement: 5,
      subject: null,
      xp_reward: 75,
      gems_reward: 25,
      rarity: "common",
      category: "progress",
      conditions: {
        chapters_completed: 5
      }
    },
    {
      _id: "ACH003",
      name: "Topic Conqueror", 
      description: "Complete an entire topic",
      icon: "🎯",
      type: "completion",
      requirement: 1,
      subject: null,
      xp_reward: 100,
      gems_reward: 30,
      rarity: "rare",
      category: "progress",
      conditions: {
        topics_completed: 1
      }
    },
    {
      _id: "ACH004",
      name: "Subject Champion",
      description: "Complete an entire subject",
      icon: "🏆",
      type: "completion", 
      requirement: 1,
      subject: null,
      xp_reward: 500,
      gems_reward: 150,
      rarity: "epic",
      category: "mastery",
      conditions: {
        subjects_completed: 1
      }
    },
    {
      _id: "ACH005",
      name: "Math Wizard",
      description: "Complete 10 mathematics topics",
      icon: "🧙‍♂️",
      type: "completion",
      requirement: 10,
      subject: "Mathematics",
      xp_reward: 200,
      gems_reward: 50,
      rarity: "rare",
      category: "subject_mastery",
      conditions: {
        subject_topics_completed: {
          subject: "Mathematics",
          count: 10
        }
      }
    },
    {
      _id: "ACH006",
      name: "Science Explorer",
      description: "Complete 5 physics experiments",
      icon: "🔬",
      type: "activity",
      requirement: 5,
      subject: "Physics",
      xp_reward: 150,
      gems_reward: 40,
      rarity: "rare",
      category: "experimentation",
      conditions: {
        experiments_completed: {
          subject: "Physics",
          count: 5
        }
      }
    },
  
    // ============================================================================
    // STREAK ACHIEVEMENTS  
    // ============================================================================
    {
      _id: "ACH007",
      name: "Getting Started",
      description: "Maintain a 3-day learning streak",
      icon: "🌱",
      type: "streak",
      requirement: 3,
      subject: null,
      xp_reward: 50,
      gems_reward: 15,
      rarity: "common",
      category: "consistency",
      conditions: {
        streak_days: 3
      }
    },
    {
      _id: "ACH008",
      name: "Week Warrior",
      description: "Maintain a 7-day learning streak",
      icon: "⚡",
      type: "streak", 
      requirement: 7,
      subject: null,
      xp_reward: 100,
      gems_reward: 30,
      rarity: "rare",
      category: "consistency",
      conditions: {
        streak_days: 7
      }
    },
    {
      _id: "ACH009",
      name: "Two-Week Champion",
      description: "Maintain a 14-day learning streak",
      icon: "💪",
      type: "streak",
      requirement: 14,
      subject: null,
      xp_reward: 200,
      gems_reward: 60,
      rarity: "epic",
      category: "consistency",
      conditions: {
        streak_days: 14
      }
    },
    {
      _id: "ACH010",
      name: "Monthly Master",
      description: "Maintain a 30-day learning streak",
      icon: "🔥",
      type: "streak",
      requirement: 30,
      subject: null,
      xp_reward: 400,
      gems_reward: 120,
      rarity: "epic",
      category: "consistency",
      conditions: {
        streak_days: 30
      }
    },
    {
      _id: "ACH011", 
      name: "Streak Superhero",
      description: "Maintain a 100-day learning streak",
      icon: "🦸‍♂️",
      type: "streak",
      requirement: 100,
      subject: null,
      xp_reward: 1000,
      gems_reward: 300,
      rarity: "legendary",
      category: "consistency",
      conditions: {
        streak_days: 100
      }
    },
  
    // ============================================================================
    // PERFORMANCE ACHIEVEMENTS
    // ============================================================================
    {
      _id: "ACH012",
      name: "Perfect Score",
      description: "Get 100% on any quiz",
      icon: "💯",
      type: "performance",
      requirement: 100,
      subject: null,
      xp_reward: 100,
      gems_reward: 25,
      rarity: "rare",
      category: "excellence",
      conditions: {
        quiz_score: 100
      }
    },
    {
      _id: "ACH013",
      name: "Ace Student",
      description: "Maintain 90% average across 5 quizzes",
      icon: "🌟",
      type: "performance",
      requirement: 90,
      subject: null,
      xp_reward: 200,
      gems_reward: 50,
      rarity: "epic",
      category: "excellence",
      conditions: {
        average_quiz_score: 90,
        min_quizzes: 5
      }
    },
    {
      _id: "ACH014",
      name: "Quick Learner",
      description: "Complete a chapter in under 30 minutes",
      icon: "⚡",
      type: "performance", 
      requirement: 30,
      subject: null,
      xp_reward: 75,
      gems_reward: 20,
      rarity: "rare",
      category: "efficiency",
      conditions: {
        chapter_completion_time: 30 // minutes
      }
    },
    {
      _id: "ACH015",
      name: "Night Owl",
      description: "Study for 2 hours after 8 PM",
      icon: "🦉",
      type: "activity",
      requirement: 120,
      subject: null,
      xp_reward: 50,
      gems_reward: 15,
      rarity: "common", 
      category: "dedication",
      conditions: {
        study_time_after_hour: {
          hour: 20, // 8 PM
          minutes: 120
        }
      }
    },
  
    // ============================================================================
    // ACTIVITY ACHIEVEMENTS
    // ============================================================================
    {
      _id: "ACH016",
      name: "Video Learner",
      description: "Watch 10 educational videos",
      icon: "📹",
      type: "activity",
      requirement: 10,
      subject: null,
      xp_reward: 75,
      gems_reward: 20,
      rarity: "common",
      category: "content_consumption",
      conditions: {
        videos_watched: 10
      }
    },
    {
      _id: "ACH017",
      name: "Experiment Enthusiast", 
      description: "Complete 15 experiments",
      icon: "🧪",
      type: "activity",
      requirement: 15,
      subject: null,
      xp_reward: 150,
      gems_reward: 40,
      rarity: "rare",
      category: "experimentation",
      conditions: {
        experiments_completed: 15
      }
    },
    {
      _id: "ACH018",
      name: "Simulation Master",
      description: "Complete 20 simulations",
      icon: "🎯",
      type: "activity",
      requirement: 20,
      subject: null,
      xp_reward: 125,
      gems_reward: 35,
      rarity: "rare",
      category: "simulation",
      conditions: {
        simulations_completed: 20
      }
    },
    {
      _id: "ACH019",
      name: "Quiz Champion",
      description: "Complete 50 quizzes",
      icon: "❓", 
      type: "activity",
      requirement: 50,
      subject: null,
      xp_reward: 200,
      gems_reward: 60,
      rarity: "epic",
      category: "assessment",
      conditions: {
        quizzes_completed: 50
      }
    },
    {
      _id: "ACH020",
      name: "Study Marathon",
      description: "Study for 5 hours in a single day",
      icon: "🏃‍♂️",
      type: "activity",
      requirement: 300,
      subject: null,
      xp_reward: 150,
      gems_reward: 40,
      rarity: "rare", 
      category: "dedication",
      conditions: {
        daily_study_time: 300 // minutes
      }
    },
  
    // ============================================================================
    // SUBJECT-SPECIFIC ACHIEVEMENTS
    // ============================================================================
    {
      _id: "ACH021",
      name: "Physics Phenomenon",
      description: "Complete all physics experiments",
      icon: "⚛️",
      type: "completion",
      requirement: 100, // percentage
      subject: "Physics",
      xp_reward: 300,
      gems_reward: 75,
      rarity: "epic",
      category: "subject_mastery",
      conditions: {
        subject_experiments_completion: {
          subject: "Physics",
          percentage: 100
        }
      }
    },
    {
      _id: "ACH022",
      name: "Chemistry Catalyst",
      description: "Complete all chemistry topics with 85% average",
      icon: "⚗️",
      type: "performance",
      requirement: 85,
      subject: "Chemistry",
      xp_reward: 400,
      gems_reward: 100,
      rarity: "epic", 
      category: "subject_mastery",
      conditions: {
        subject_average_score: {
          subject: "Chemistry",
          average: 85
        }
      }
    },
    {
      _id: "ACH023",
      name: "Biology Biologist",
      description: "View all 3D biology models",
      icon: "🧬",
      type: "activity",
      requirement: 100, // percentage
      subject: "Biology",
      xp_reward: 200,
      gems_reward: 50,
      rarity: "rare",
      category: "subject_exploration",
      conditions: {
        subject_3d_models_viewed: {
          subject: "Biology", 
          percentage: 100
        }
      }
    },
  
    // ============================================================================
    // SOCIAL ACHIEVEMENTS
    // ============================================================================
    {
      _id: "ACH024",
      name: "Helpful Friend",
      description: "Help 5 fellow students (Future feature)",
      icon: "🤝",
      type: "social",
      requirement: 5,
      subject: null,
      xp_reward: 100,
      gems_reward: 30,
      rarity: "rare",
      category: "community",
      conditions: {
        students_helped: 5
      },
      coming_soon: true
    },
    {
      _id: "ACH025",
      name: "Study Group Leader", 
      description: "Create and lead a study group (Future feature)",
      icon: "👥",
      type: "social",
      requirement: 1,
      subject: null,
      xp_reward: 200,
      gems_reward: 60,
      rarity: "epic",
      category: "leadership",
      conditions: {
        study_groups_created: 1
      },
      coming_soon: true
    },
  
    // ============================================================================
    // TIME-BASED ACHIEVEMENTS
    // ============================================================================
    {
      _id: "ACH026",
      name: "Early Bird",
      description: "Study for 1 hour before 7 AM",
      icon: "🌅",
      type: "activity",
      requirement: 60,
      subject: null,
      xp_reward: 75,
      gems_reward: 20,
      rarity: "rare",
      category: "dedication",
      conditions: {
        study_time_before_hour: {
          hour: 7, // 7 AM
          minutes: 60
        }
      }
    },
    {
      _id: "ACH027",
      name: "Weekend Warrior",
      description: "Study for 3 hours on weekend", 
      icon: "📅",
      type: "activity",
      requirement: 180,
      subject: null,
      xp_reward: 100,
      gems_reward: 25,
      rarity: "rare",
      category: "dedication",
      conditions: {
        weekend_study_time: 180 // minutes
      }
    },
    {
      _id: "ACH028",
      name: "Monthly Milestone",
      description: "Study 50 hours in a month",
      icon: "📊",
      type: "activity",
      requirement: 3000, // minutes
      subject: null,
      xp_reward: 300,
      gems_reward: 80,
      rarity: "epic",
      category: "dedication",
      conditions: {
        monthly_study_time: 3000 // minutes
      }
    },
  
    // ============================================================================
    // SPECIAL ACHIEVEMENTS
    // ============================================================================
    {
      _id: "ACH029",
      name: "First Login",
      description: "Welcome to Ekima! Complete your first login",
      icon: "🎉",
      type: "milestone",
      requirement: 1,
      subject: null,
      xp_reward: 25,
      gems_reward: 10,
      rarity: "common",
      category: "getting_started",
      conditions: {
        logins: 1
      }
    },
    {
      _id: "ACH030",
      name: "Profile Complete",
      description: "Complete your user profile",
      icon: "📝",
      type: "milestone",
      requirement: 100, // percentage
      subject: null,
      xp_reward: 50,
      gems_reward: 15,
      rarity: "common",
      category: "getting_started",
      conditions: {
        profile_completion: 100
      }
    },
    {
      _id: "ACH031",
      name: "Feedback Provider",
      description: "Provide feedback on 10 recommendations",
      icon: "💬",
      type: "engagement",
      requirement: 10,
      subject: null,
      xp_reward: 75,
      gems_reward: 20,
      rarity: "rare",
      category: "community",
      conditions: {
        feedback_provided: 10
      }
    },
    {
      _id: "ACH032",
      name: "Explorer",
      description: "Try all types of content (video, experiment, simulation, quiz)",
      icon: "🗺️",
      type: "exploration",
      requirement: 4,
      subject: null,
      xp_reward: 100,
      gems_reward: 30,
      rarity: "rare",
      category: "exploration",
      conditions: {
        content_types_tried: 4
      }
    }
  ];
  
  // Achievement categories for organization
  export const achievementCategories = {
    getting_started: {
      name: "Getting Started",
      description: "First steps in your learning journey",
      icon: "🚀",
      color: "#10b981"
    },
    progress: {
      name: "Progress",
      description: "Learning milestones and advancement",
      icon: "📈", 
      color: "#3b82f6"
    },
    consistency: {
      name: "Consistency", 
      description: "Daily learning habits and streaks",
      icon: "🔥",
      color: "#f59e0b"
    },
    excellence: {
      name: "Excellence",
      description: "Outstanding performance and scores",
      icon: "⭐",
      color: "#8b5cf6"
    },
    mastery: {
      name: "Mastery",
      description: "Complete subject and topic mastery",
      icon: "🎓",
      color: "#dc2626"
    },
    experimentation: {
      name: "Experimentation",
      description: "Hands-on learning and exploration",
      icon: "🔬", 
      color: "#059669"
    },
    dedication: {
      name: "Dedication",
      description: "Time commitment and persistence",
      icon: "💪",
      color: "#7c3aed"
    },
    community: {
      name: "Community",
      description: "Helping others and social learning",
      icon: "🤝",
      color: "#ea580c"
    }
  };
  
  // Rarity levels
  export const rarityLevels = {
    common: {
      name: "Common",
      color: "#6b7280",
      description: "Basic achievements for getting started",
      probability: 0.7
    },
    rare: {
      name: "Rare", 
      color: "#3b82f6",
      description: "Achievements requiring effort and consistency",
      probability: 0.25
    },
    epic: {
      name: "Epic",
      color: "#8b5cf6", 
      description: "Challenging achievements for dedicated learners",
      probability: 0.04
    },
    legendary: {
      name: "Legendary",
      color: "#f59e0b",
      description: "Extremely rare achievements for exceptional learners",
      probability: 0.01
    }
  };
  
  // Helper functions
  export const getAchievementById = (id) => {
    return achievements.find(achievement => achievement._id === id);
  };
  
  export const getAchievementsByCategory = (category) => {
    return achievements.filter(achievement => achievement.category === category);
  };
  
  export const getAchievementsBySubject = (subject) => {
    return achievements.filter(achievement => achievement.subject === subject);
  };
  
  export const getAchievementsByType = (type) => {
    return achievements.filter(achievement => achievement.type === type);
  };
  
  export const getAchievementsByRarity = (rarity) => {
    return achievements.filter(achievement => achievement.rarity === rarity);
  };
  
  export const getAvailableAchievements = () => {
    return achievements.filter(achievement => !achievement.coming_soon);
  };
  
  export const checkAchievementConditions = (achievement, userStats) => {
    const conditions = achievement.conditions;
    
    // Implementation would check each condition against user stats
    // This is a simplified example
    if (conditions.chapters_completed) {
      return userStats.chaptersCompleted >= conditions.chapters_completed;
    }
    
    if (conditions.streak_days) {
      return userStats.currentStreak >= conditions.streak_days;
    }
    
    if (conditions.quiz_score) {
      return userStats.maxQuizScore >= conditions.quiz_score;
    }
    
    // Add more condition checks as needed
    return false;
  };
  
  export const calculateAchievementProgress = (achievement, userStats) => {
    const conditions = achievement.conditions;
    const requirement = achievement.requirement;
    
    // Calculate progress percentage based on conditions
    if (conditions.chapters_completed) {
      return Math.min((userStats.chaptersCompleted / requirement) * 100, 100);
    }
    
    if (conditions.streak_days) {
      return Math.min((userStats.currentStreak / requirement) * 100, 100);
    }
    
    // Add more progress calculations as needed
    return 0;
  };
  
  export default {
    achievements,
    achievementCategories,
    rarityLevels,
    getAchievementById,
    getAchievementsByCategory,
    getAchievementsBySubject,
    getAchievementsByType,
    getAchievementsByRarity,
    getAvailableAchievements,
    checkAchievementConditions,
    calculateAchievementProgress
  };