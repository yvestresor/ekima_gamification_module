// Enhanced mock data based on TIE API structure for recommendations

export const mockUser = {
    _id: "665f1fab9c934afcd203a2aa",
    name: "Yves-tresor Nsabimana",
    email: "yves@example.com",
    username: "yves_tresor",
    type: "student",
    role: "learner",
    ageGroup: "13-15",
    gender: "male",
    region: "Kigali",
    district: "Gasabo",
    school: "Riviera High School",
    level: "665f1fab9c934afcd203a2bb", // O-Level reference
    deviceType: "mobile",
    timeSpent: 2380000, // in milliseconds
    loginAt: "2025-07-07T08:00:00Z",
    status: 1,
    profilePic: "/api/uploads/profiles/default.jpg",
    joinedAt: "2025-07-02T08:00:00Z",
    
    // Gamification fields
    gems: 150,
    coins: 320,
    xp: 1250,
    level_number: 5,
    streak: 7,
    total_time_studied: 2380000,
    achievements_unlocked: 8
  };
  
  export const mockSubjects = [
    {
      _id: "SUB001",
      name: "Mathematics",
      description: "Mathematical concepts for O-Level students",
      thumbnail: "/api/uploads/subjects/math.jpg",
      viewedBy: ["665f1fab9c934afcd203a2aa"],
      syllabus: "NECTA",
      difficulty_level: "intermediate",
      estimated_duration: "120 hours",
      prerequisites: [],
      learning_outcomes: [
        "Solve algebraic equations",
        "Understand geometric principles",
        "Apply statistical methods"
      ]
    },
    {
      _id: "SUB002", 
      name: "Physics",
      description: "Physical sciences and natural phenomena",
      thumbnail: "/api/uploads/subjects/physics.jpg",
      viewedBy: ["665f1fab9c934afcd203a2aa"],
      syllabus: "NECTA",
      difficulty_level: "advanced",
      estimated_duration: "140 hours",
      prerequisites: ["Basic Mathematics"],
      learning_outcomes: [
        "Understand motion and forces",
        "Analyze energy transformations",
        "Apply wave principles"
      ]
    },
    {
      _id: "SUB003",
      name: "Chemistry", 
      description: "Chemical reactions and molecular structures",
      thumbnail: "/api/uploads/subjects/chemistry.jpg",
      viewedBy: [],
      syllabus: "NECTA",
      difficulty_level: "advanced",
      estimated_duration: "130 hours",
      prerequisites: ["Basic Mathematics", "Basic Physics"],
      learning_outcomes: [
        "Understand atomic structure",
        "Predict chemical reactions",
        "Apply stoichiometry"
      ]
    },
    {
      _id: "SUB004",
      name: "Biology",
      description: "Living organisms and life processes",
      thumbnail: "/api/uploads/subjects/biology.jpg", 
      viewedBy: ["665f1fab9c934afcd203a2aa"],
      syllabus: "NECTA",
      difficulty_level: "intermediate",
      estimated_duration: "125 hours",
      prerequisites: ["Basic Chemistry"],
      learning_outcomes: [
        "Understand cell biology",
        "Analyze genetic principles",
        "Study ecosystems"
      ]
    }
  ];
  
  export const mockTopics = [
    {
      _id: "TOP001",
      name: "Linear Equations",
      subject: "SUB001",
      level: "665f1fab9c934afcd203a2bb",
      educationLevel: "665f1fab9c934afcd203a2cc",
      syllabus: "NECTA",
      isFeatured: true,
      descriptions: "Solving equations with one variable",
      viewedBy: ["665f1fab9c934afcd203a2aa"],
      language: "LNG001",
      difficulty: "Medium",
      estimatedTime: "45 minutes",
      prerequisites: ["Algebra Basics"],
      learning_objectives: [
        "Solve linear equations in one variable",
        "Apply linear equations to real-world problems"
      ]
    },
    {
      _id: "TOP002",
      name: "Newton's Laws of Motion",
      subject: "SUB002", 
      level: "665f1fab9c934afcd203a2bb",
      educationLevel: "665f1fab9c934afcd203a2cc",
      syllabus: "NECTA",
      isFeatured: true,
      descriptions: "Fundamental laws governing motion",
      viewedBy: [],
      language: "LNG001",
      difficulty: "Hard",
      estimatedTime: "60 minutes",
      prerequisites: ["Force and Motion Basics"],
      learning_objectives: [
        "Understand Newton's three laws",
        "Apply laws to solve motion problems"
      ]
    },
    {
      _id: "TOP003",
      name: "Cell Division",
      subject: "SUB004",
      level: "665f1fab9c934afcd203a2bb", 
      educationLevel: "665f1fab9c934afcd203a2cc",
      syllabus: "NECTA",
      isFeatured: false,
      descriptions: "Process of cellular reproduction",
      viewedBy: ["665f1fab9c934afcd203a2aa"],
      language: "LNG001",
      difficulty: "Easy",
      estimatedTime: "35 minutes",
      prerequisites: ["Cell Structure"],
      learning_objectives: [
        "Understand mitosis and meiosis",
        "Compare different types of cell division"
      ]
    }
  ];
  
  export const mockProgress = [
    {
      _id: "PROG001",
      userId: "665f1fab9c934afcd203a2aa",
      chapterId: "CH001",
      videoProgress: 85,
      notesProgress: 90,
      experimentsAttempted: 3,
      totalExperiments: 4,
      overallProgress: 88,
      assessmentScoreAverage: 82,
      isCompleted: false,
      completedAt: null,
      lastAccessedAt: "2025-07-06T14:30:00Z",
      
      // Enhanced tracking fields
      timeSpent: 3600000, // 1 hour in milliseconds
      interactionCount: 15,
      contentTypePreference: "video", // video, text, simulation, experiment
      strugglingAreas: ["complex_equations"],
      masteredConcepts: ["basic_algebra", "simple_equations"],
      recommendationUsed: true,
      recommendationEffectiveness: 0.85
    },
    {
      _id: "PROG002", 
      userId: "665f1fab9c934afcd203a2aa",
      chapterId: "CH002",
      videoProgress: 60,
      notesProgress: 70,
      experimentsAttempted: 1,
      totalExperiments: 3,
      overallProgress: 65,
      assessmentScoreAverage: 75,
      isCompleted: false,
      completedAt: null,
      lastAccessedAt: "2025-07-05T16:20:00Z",
      
      timeSpent: 2400000, // 40 minutes
      interactionCount: 8,
      contentTypePreference: "simulation",
      strugglingAreas: ["force_calculations"],
      masteredConcepts: ["basic_motion"],
      recommendationUsed: false,
      recommendationEffectiveness: null
    }
  ];
  
  export const mockQuizAttempts = [
    {
      _id: "QA001",
      userId: "665f1fab9c934afcd203a2aa",
      chapterId: "CH001",
      questionId: "Q001",
      score: 85,
      totalQuestions: 10,
      correctAnswers: 8,
      timeSpent: 600000, // 10 minutes
      createdAt: "2025-07-06T10:30:00Z",
      difficulty: "Medium",
      topic: "Linear Equations",
      subject: "Mathematics"
    },
    {
      _id: "QA002",
      userId: "665f1fab9c934afcd203a2aa", 
      chapterId: "CH001",
      questionId: "Q002",
      score: 90,
      totalQuestions: 5,
      correctAnswers: 4,
      timeSpent: 300000, // 5 minutes
      createdAt: "2025-07-05T15:45:00Z",
      difficulty: "Easy", 
      topic: "Linear Equations",
      subject: "Mathematics"
    }
  ];
  
  export const mockAchievements = [
    {
      _id: "ACH001",
      name: "Math Wizard",
      description: "Complete 10 mathematics topics",
      icon: "🧙‍♂️",
      type: "completion",
      requirement: 10,
      subject: "Mathematics",
      xp_reward: 100,
      gems_reward: 25,
      unlocked: true,
      unlockedAt: "2025-07-01T12:00:00Z"
    },
    {
      _id: "ACH002",
      name: "Experiment Master",
      description: "Complete 15 experiments",
      icon: "🔬",
      type: "activity",
      requirement: 15,
      subject: null,
      xp_reward: 150,
      gems_reward: 30,
      unlocked: true,
      unlockedAt: "2025-07-03T09:15:00Z"
    },
    {
      _id: "ACH003",
      name: "Quick Learner",
      description: "Maintain a 7-day learning streak",
      icon: "⚡",
      type: "streak",
      requirement: 7,
      subject: null,
      xp_reward: 75,
      gems_reward: 20,
      unlocked: true,
      unlockedAt: "2025-07-06T08:00:00Z"
    },
    {
      _id: "ACH004",
      name: "Perfect Score",
      description: "Get 100% on any quiz",
      icon: "💯",
      type: "performance",
      requirement: 100,
      subject: null,
      xp_reward: 200,
      gems_reward: 50,
      unlocked: false,
      unlockedAt: null
    }
  ];
  
  // Recommendation algorithm factors
  export const mockRecommendationFactors = {
    userLearningStyle: "visual", // visual, auditory, kinesthetic, reading
    preferredDifficulty: "medium", // easy, medium, hard
    averageSessionTime: 45, // minutes
    bestPerformanceTime: "afternoon", // morning, afternoon, evening
    weakestSubjects: ["Physics"],
    strongestSubjects: ["Mathematics", "Biology"],
    contentTypePreferences: {
      video: 0.4,
      simulation: 0.3, 
      experiment: 0.2,
      text: 0.1
    },
    learningGoals: [
      "improve_physics_scores",
      "complete_necta_syllabus", 
      "master_problem_solving"
    ]
  };
  
  // Generated recommendations based on user data
  export const mockGeneratedRecommendations = [
    {
      _id: "REC001",
      userId: "665f1fab9c934afcd203a2aa",
      topicId: "TOP001",
      topic: "Linear Equations",
      subject: "Mathematics",
      reason: "Based on your strong algebra performance and 82% average score",
      confidence: 0.89,
      difficulty: "Medium",
      estimatedTime: "45 minutes",
      contentTypes: ["video", "simulation", "quiz"],
      priority: 1,
      createdAt: "2025-07-07T08:00:00Z",
      used: false,
      feedback: null
    },
    {
      _id: "REC002", 
      userId: "665f1fab9c934afcd203a2aa",
      topicId: "TOP002",
      topic: "Newton's Laws of Motion",
      subject: "Physics", 
      reason: "Next logical step after mastering basic motion concepts",
      confidence: 0.76,
      difficulty: "Hard",
      estimatedTime: "60 minutes",
      contentTypes: ["experiment", "video", "quiz"],
      priority: 2,
      createdAt: "2025-07-07T08:00:00Z",
      used: false,
      feedback: null
    },
    {
      _id: "REC003",
      userId: "665f1fab9c934afcd203a2aa", 
      topicId: "TOP003",
      topic: "Cell Division",
      subject: "Biology",
      reason: "Strengthen your biology foundation before advanced topics",
      confidence: 0.92,
      difficulty: "Easy",
      estimatedTime: "35 minutes", 
      contentTypes: ["3d-model", "video", "quiz"],
      priority: 3,
      createdAt: "2025-07-07T08:00:00Z",
      used: false,
      feedback: null
    }
  ];
  
  export const mockLearningPath = {
    userId: "665f1fab9c934afcd203a2aa",
    currentLevel: "O-Level",
    completedTopics: ["Algebra Basics", "Cell Structure", "Basic Motion"],
    inProgress: ["Linear Equations", "Force and Motion"],
    recommended: ["Newton's Laws", "Quadratic Equations", "Cell Division"],
    nextMilestone: "Complete Mathematics Foundation",
    estimatedCompletionDate: "2025-09-15",
    overallProgress: 35 // percentage
  };
  
  export default {
    mockUser,
    mockSubjects,
    mockTopics, 
    mockProgress,
    mockQuizAttempts,
    mockAchievements,
    mockRecommendationFactors,
    mockGeneratedRecommendations,
    mockLearningPath
  };