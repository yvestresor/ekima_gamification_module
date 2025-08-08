// Subject definitions for Ekima Learning Platform
// Based on NECTA curriculum for Tanzania

export const subjects = [
    {
      _id: "SUB001",
      name: "Mathematics",
      code: "MATH",
      description: "Mathematical concepts, problem-solving, and analytical thinking for O-Level students",
      thumbnail: "🔢",
      icon: "calculator",
      color: "#3b82f6", // Blue
      bgGradient: "from-blue-400 to-blue-600",
      difficulty_level: "intermediate",
      estimated_duration: "120 hours",
      syllabus: "NECTA",
      education_level: "Secondary",
      level: "O-Level",
      prerequisites: ["Basic Arithmetic", "Primary Mathematics"],
      learning_outcomes: [
        "Solve algebraic equations and inequalities",
        "Understand and apply geometric principles",
        "Analyze statistical data and probability",
        "Apply mathematical reasoning to real-world problems",
        "Master trigonometric concepts and applications"
      ],
      topics: [
        {
          id: "TOP001",
          name: "Algebra",
          description: "Linear equations, quadratic equations, and algebraic expressions",
          estimatedTime: "25 hours",
          difficulty: "Medium",
          chapters: ["Linear Equations", "Quadratic Equations", "Algebraic Expressions", "Inequalities"]
        },
        {
          id: "TOP002", 
          name: "Geometry",
          description: "Properties of shapes, area, volume, and geometric constructions",
          estimatedTime: "30 hours",
          difficulty: "Medium",
          chapters: ["Properties of Shapes", "Area and Perimeter", "Volume and Surface Area", "Geometric Constructions"]
        },
        {
          id: "TOP003",
          name: "Trigonometry", 
          description: "Trigonometric ratios, identities, and applications",
          estimatedTime: "20 hours",
          difficulty: "Hard",
          chapters: ["Trigonometric Ratios", "Trigonometric Identities", "Solving Triangles", "Applications"]
        },
        {
          id: "TOP004",
          name: "Statistics",
          description: "Data collection, analysis, and interpretation",
          estimatedTime: "15 hours", 
          difficulty: "Easy",
          chapters: ["Data Collection", "Measures of Central Tendency", "Graphs and Charts", "Probability"]
        }
      ],
      content_types: ["video", "simulation", "quiz", "notes", "experiment"],
      skills_developed: [
        "Problem Solving",
        "Logical Reasoning", 
        "Critical Thinking",
        "Pattern Recognition",
        "Mathematical Communication"
      ]
    },
    
    {
      _id: "SUB002",
      name: "Physics",
      code: "PHYS", 
      description: "Understanding the fundamental laws of nature and physical phenomena",
      thumbnail: "⚗️",
      icon: "atom",
      color: "#10b981", // Green
      bgGradient: "from-green-400 to-green-600",
      difficulty_level: "advanced",
      estimated_duration: "140 hours",
      syllabus: "NECTA",
      education_level: "Secondary", 
      level: "O-Level",
      prerequisites: ["Basic Mathematics", "Basic Science Concepts"],
      learning_outcomes: [
        "Understand motion, forces, and energy",
        "Analyze wave properties and behavior",
        "Apply electromagnetic principles",
        "Investigate heat and thermodynamics",
        "Explore atomic and nuclear physics"
      ],
      topics: [
        {
          id: "TOP005",
          name: "Mechanics",
          description: "Motion, forces, work, energy, and momentum",
          estimatedTime: "40 hours",
          difficulty: "Medium", 
          chapters: ["Motion in a Straight Line", "Forces and Newton's Laws", "Work and Energy", "Momentum and Collisions"]
        },
        {
          id: "TOP006",
          name: "Waves",
          description: "Wave properties, sound, and electromagnetic waves",
          estimatedTime: "25 hours",
          difficulty: "Medium",
          chapters: ["Wave Properties", "Sound Waves", "Light Waves", "Wave Interactions"]
        },
        {
          id: "TOP007", 
          name: "Electricity and Magnetism",
          description: "Electric circuits, electromagnetic fields, and applications",
          estimatedTime: "35 hours",
          difficulty: "Hard",
          chapters: ["Electric Circuits", "Electric Fields", "Magnetic Fields", "Electromagnetic Induction"]
        },
        {
          id: "TOP008",
          name: "Heat and Temperature",
          description: "Thermal properties, heat transfer, and thermodynamics",
          estimatedTime: "20 hours",
          difficulty: "Medium",
          chapters: ["Temperature and Heat", "Heat Transfer", "Thermal Expansion", "Gas Laws"]
        },
        {
          id: "TOP009",
          name: "Atomic Physics", 
          description: "Atomic structure, radioactivity, and nuclear physics",
          estimatedTime: "20 hours",
          difficulty: "Hard",
          chapters: ["Atomic Structure", "Radioactivity", "Nuclear Reactions", "Applications"]
        }
      ],
      content_types: ["video", "experiment", "simulation", "quiz", "notes"],
      skills_developed: [
        "Scientific Method",
        "Data Analysis",
        "Mathematical Modeling",
        "Laboratory Skills",
        "Critical Evaluation"
      ]
    },
  
    {
      _id: "SUB003",
      name: "Chemistry",
      code: "CHEM",
      description: "Study of matter, chemical reactions, and molecular interactions",
      thumbnail: "🧪", 
      icon: "flask",
      color: "#8b5cf6", // Purple
      bgGradient: "from-purple-400 to-purple-600",
      difficulty_level: "advanced",
      estimated_duration: "130 hours",
      syllabus: "NECTA",
      education_level: "Secondary",
      level: "O-Level", 
      prerequisites: ["Basic Mathematics", "Basic Science Knowledge"],
      learning_outcomes: [
        "Understand atomic structure and bonding",
        "Analyze chemical reactions and equations",
        "Apply concepts of acids, bases, and salts",
        "Investigate organic chemistry principles",
        "Explore industrial chemistry applications"
      ],
      topics: [
        {
          id: "TOP010",
          name: "Atomic Structure",
          description: "Atoms, electrons, and chemical bonding",
          estimatedTime: "25 hours",
          difficulty: "Medium",
          chapters: ["Atomic Theory", "Electronic Configuration", "Chemical Bonding", "Periodic Table"]
        },
        {
          id: "TOP011",
          name: "Chemical Reactions", 
          description: "Types of reactions, equations, and stoichiometry",
          estimatedTime: "30 hours",
          difficulty: "Medium",
          chapters: ["Types of Reactions", "Chemical Equations", "Stoichiometry", "Reaction Rates"]
        },
        {
          id: "TOP012",
          name: "Acids, Bases and Salts",
          description: "Properties, reactions, and applications of acids and bases",
          estimatedTime: "25 hours", 
          difficulty: "Medium",
          chapters: ["Properties of Acids and Bases", "pH and Indicators", "Salt Formation", "Applications"]
        },
        {
          id: "TOP013",
          name: "Organic Chemistry",
          description: "Carbon compounds, hydrocarbons, and functional groups",
          estimatedTime: "30 hours",
          difficulty: "Hard",
          chapters: ["Hydrocarbons", "Functional Groups", "Organic Reactions", "Polymers"]
        },
        {
          id: "TOP014",
          name: "Environmental Chemistry",
          description: "Chemical processes in the environment and pollution",
          estimatedTime: "20 hours",
          difficulty: "Easy",
          chapters: ["Air Pollution", "Water Chemistry", "Soil Chemistry", "Green Chemistry"]
        }
      ],
      content_types: ["video", "experiment", "3d-model", "quiz", "notes"],
      skills_developed: [
        "Laboratory Techniques",
        "Chemical Analysis", 
        "Problem Solving",
        "Safety Awareness",
        "Environmental Consciousness"
      ]
    },
  
    {
      _id: "SUB004",
      name: "Biology",
      code: "BIO",
      description: "Study of living organisms, life processes, and ecosystems",
      thumbnail: "🧬",
      icon: "dna", 
      color: "#059669", // Emerald
      bgGradient: "from-emerald-400 to-emerald-600",
      difficulty_level: "intermediate",
      estimated_duration: "125 hours",
      syllabus: "NECTA",
      education_level: "Secondary",
      level: "O-Level",
      prerequisites: ["Basic Science Knowledge", "Elementary Biology"],
      learning_outcomes: [
        "Understand cell structure and functions",
        "Analyze human body systems and health",
        "Investigate plant biology and nutrition",
        "Explore genetics and heredity",
        "Study ecology and environmental science"
      ],
      topics: [
        {
          id: "TOP015",
          name: "Cell Biology",
          description: "Cell structure, organelles, and cellular processes",
          estimatedTime: "25 hours",
          difficulty: "Medium",
          chapters: ["Cell Structure", "Cell Organelles", "Cell Division", "Cell Metabolism"]
        },
        {
          id: "TOP016",
          name: "Human Biology", 
          description: "Human body systems, health, and disease",
          estimatedTime: "35 hours",
          difficulty: "Medium",
          chapters: ["Digestive System", "Circulatory System", "Respiratory System", "Nervous System", "Reproductive System"]
        },
        {
          id: "TOP017",
          name: "Plant Biology",
          description: "Plant structure, nutrition, and reproduction",
          estimatedTime: "25 hours",
          difficulty: "Easy",
          chapters: ["Plant Structure", "Photosynthesis", "Plant Nutrition", "Plant Reproduction"]
        },
        {
          id: "TOP018",
          name: "Genetics",
          description: "Heredity, DNA, and genetic variation", 
          estimatedTime: "20 hours",
          difficulty: "Hard",
          chapters: ["DNA and Genes", "Inheritance", "Genetic Variation", "Genetic Engineering"]
        },
        {
          id: "TOP019",
          name: "Ecology",
          description: "Ecosystems, biodiversity, and environmental conservation",
          estimatedTime: "20 hours",
          difficulty: "Easy", 
          chapters: ["Ecosystems", "Food Chains and Webs", "Biodiversity", "Conservation"]
        }
      ],
      content_types: ["video", "3d-model", "experiment", "quiz", "notes"],
      skills_developed: [
        "Scientific Observation",
        "Data Collection and Analysis",
        "Microscopy Skills", 
        "Environmental Awareness",
        "Health and Safety"
      ]
    },
  
    {
      _id: "SUB005",
      name: "English Language",
      code: "ENG",
      description: "Communication skills, literature, and language proficiency",
      thumbnail: "📚",
      icon: "book-open",
      color: "#dc2626", // Red
      bgGradient: "from-red-400 to-red-600", 
      difficulty_level: "intermediate",
      estimated_duration: "100 hours",
      syllabus: "NECTA",
      education_level: "Secondary",
      level: "O-Level",
      prerequisites: ["Basic English", "Primary English"],
      learning_outcomes: [
        "Develop effective communication skills",
        "Analyze literary texts and themes", 
        "Master grammar and vocabulary",
        "Improve reading comprehension",
        "Enhance writing and presentation skills"
      ],
      topics: [
        {
          id: "TOP020",
          name: "Grammar and Vocabulary",
          description: "Parts of speech, sentence structure, and word usage",
          estimatedTime: "25 hours",
          difficulty: "Medium",
          chapters: ["Parts of Speech", "Sentence Structure", "Vocabulary Building", "Word Formation"]
        },
        {
          id: "TOP021",
          name: "Reading Comprehension",
          description: "Reading strategies and text analysis", 
          estimatedTime: "25 hours",
          difficulty: "Medium",
          chapters: ["Reading Strategies", "Text Types", "Critical Reading", "Inference Skills"]
        },
        {
          id: "TOP022",
          name: "Writing Skills",
          description: "Essay writing, creative writing, and formal writing",
          estimatedTime: "25 hours",
          difficulty: "Medium",
          chapters: ["Essay Writing", "Creative Writing", "Formal Letters", "Report Writing"]
        },
        {
          id: "TOP023",
          name: "Literature",
          description: "Poetry, prose, and drama analysis",
          estimatedTime: "25 hours",
          difficulty: "Hard", 
          chapters: ["Poetry Analysis", "Prose Studies", "Drama Appreciation", "Literary Devices"]
        }
      ],
      content_types: ["video", "audio", "quiz", "notes"],
      skills_developed: [
        "Communication",
        "Critical Thinking",
        "Creative Expression",
        "Analytical Skills",
        "Cultural Awareness"
      ]
    },
  
    {
      _id: "SUB006",
      name: "Kiswahili",
      code: "KIS", 
      description: "Lugha ya Kiswahili, fasihi, na utamaduni wa Kiafrika",
      thumbnail: "🗣️",
      icon: "message-circle",
      color: "#7c3aed", // Violet
      bgGradient: "from-violet-400 to-violet-600",
      difficulty_level: "intermediate",
      estimated_duration: "90 hours",
      syllabus: "NECTA",
      education_level: "Secondary",
      level: "O-Level",
      prerequisites: ["Kiswahili cha Msingi", "Kiswahili cha Shule ya Msingi"],
      learning_outcomes: [
        "Kutumia lugha ya Kiswahili kwa ufasaha",
        "Kuchambua kazi za kifasihi",
        "Kuelewa sarufi na muundo wa sentensi",
        "Kuandika insha na maandishi mengine",
        "Kuelewa utamaduni wa Kiafrika"
      ],
      topics: [
        {
          id: "TOP024",
          name: "Sarufi",
          description: "Miundo ya lugha, silabi, na kanuni za lugha",
          estimatedTime: "25 hours",
          difficulty: "Medium", 
          chapters: ["Vipengele vya Lugha", "Muundo wa Sentensi", "Kamusi", "Matamshi"]
        },
        {
          id: "TOP025", 
          name: "Fasihi",
          description: "Mashairi, hadithi, na tamthilia",
          estimatedTime: "30 hours", 
          difficulty: "Medium",
          chapters: ["Mashairi", "Hadithi Fupi", "Riwaya", "Tamthilia"]
        },
        {
          id: "TOP026",
          name: "Uandishi",
          description: "Insha, barua, na aina za maandishi",
          estimatedTime: "20 hours",
          difficulty: "Medium",
          chapters: ["Insha za Utanzu", "Insha za Hoja", "Barua", "Ripoti"]
        },
        {
          id: "TOP027",
          name: "Utamaduni",
          description: "Mila, desturi, na utamaduni wa Kiafrika",
          estimatedTime: "15 hours",
          difficulty: "Easy",
          chapters: ["Mila na Desturi", "Methali na Nahau", "Ngoma na Muziki", "Historia ya Kiswahili"]
        }
      ],
      content_types: ["video", "audio", "quiz", "notes"],
      skills_developed: [
        "Uongozi wa Lugha",
        "Uchambuzi wa Kifasihi", 
        "Mawasiliano",
        "Utamaduni",
        "Ubunifu"
      ]
    }
  ];
  
  // Subject categories for easier organization
  export const subjectCategories = {
    sciences: {
      name: "Sciences",
      description: "Natural sciences and mathematics",
      subjects: ["SUB001", "SUB002", "SUB003", "SUB004"],
      color: "#10b981",
      icon: "🔬"
    },
    languages: {
      name: "Languages", 
      description: "Communication and literature",
      subjects: ["SUB005", "SUB006"],
      color: "#8b5cf6",
      icon: "🗣️"
    },
    social: {
      name: "Social Studies",
      description: "History, geography, and civics",
      subjects: [], // To be added
      color: "#f59e0b", 
      icon: "🌍"
    }
  };
  
  // Subject difficulty levels
  export const difficultyLevels = {
    beginner: {
      name: "Beginner",
      description: "Basic concepts and introduction",
      color: "#10b981",
      range: "0-40%"
    },
    intermediate: {
      name: "Intermediate", 
      description: "Standard O-Level concepts",
      color: "#f59e0b",
      range: "40-70%"
    },
    advanced: {
      name: "Advanced",
      description: "Complex concepts and applications", 
      color: "#ef4444",
      range: "70-100%"
    }
  };
  
  // Learning pathways
  export const learningPathways = {
    science_track: {
      name: "Science Track",
      description: "Mathematics and Natural Sciences pathway",
      required_subjects: ["SUB001", "SUB002", "SUB003", "SUB004"],
      optional_subjects: ["SUB005"],
      career_paths: ["Medicine", "Engineering", "Research", "Technology"],
      duration: "2 years"
    },
    arts_track: {
      name: "Arts Track", 
      description: "Languages and Social Sciences pathway",
      required_subjects: ["SUB005", "SUB006"],
      optional_subjects: ["SUB001"], 
      career_paths: ["Teaching", "Journalism", "Law", "Social Work"],
      duration: "2 years"
    }
  };
  
  // Export helper functions
  export const getSubjectById = (id) => {
    return subjects.find(subject => subject._id === id);
  };
  
  export const getSubjectsByCategory = (category) => {
    const categoryData = subjectCategories[category];
    if (!categoryData) return [];
    return categoryData.subjects.map(id => getSubjectById(id)).filter(Boolean);
  };
  
  export const getSubjectsByDifficulty = (difficulty) => {
    return subjects.filter(subject => subject.difficulty_level === difficulty);
  };
  
  export const getSubjectTopics = (subjectId) => {
    const subject = getSubjectById(subjectId);
    return subject ? subject.topics : [];
  };
  
  export const getSubjectSkills = (subjectId) => {
    const subject = getSubjectById(subjectId);
    return subject ? subject.skills_developed : [];
  };
  
  export default {
    subjects,
    subjectCategories,
    difficultyLevels,
    learningPathways,
    getSubjectById,
    getSubjectsByCategory,
    getSubjectsByDifficulty, 
    getSubjectTopics,
    getSubjectSkills
  };