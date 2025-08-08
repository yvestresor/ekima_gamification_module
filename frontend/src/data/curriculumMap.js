// src/data/curriculumMap.js

/**
 * Comprehensive curriculum mapping for Ekima Learning Platform
 * Defines the structure and relationships between subjects, topics, and chapters
 */

// Subject definitions with complete hierarchical structure
export const curriculumMap = {
    mathematics: {
      id: 'mathematics',
      name: 'Mathematics',
      description: 'Explore the fundamental principles of mathematics from basic arithmetic to advanced calculus',
      icon: 'Calculator',
      color: '#3B82F6', // Blue
      difficulty: 'medium',
      estimatedHours: 120,
      prerequisites: [],
      topics: {
        algebra: {
          id: 'algebra',
          name: 'Algebra',
          description: 'Master algebraic expressions, equations, and functions',
          difficulty: 'medium',
          estimatedTime: 45,
          contentTypes: ['videos', 'simulations', 'quizzes', 'readings'],
          prerequisites: ['basic_arithmetic'],
          chapters: [
            {
              id: 'linear_equations',
              name: 'Linear Equations',
              description: 'Solve linear equations with one and multiple variables',
              difficulty: 'easy',
              estimatedTime: 30,
              order: 1,
              contentTypes: ['videos', 'simulations', 'quizzes'],
              learningObjectives: [
                'Solve one-variable linear equations',
                'Graph linear equations',
                'Understand slope and y-intercept',
                'Apply linear equations to real-world problems'
              ]
            },
            {
              id: 'quadratic_equations',
              name: 'Quadratic Equations',
              description: 'Explore quadratic functions and their solutions',
              difficulty: 'medium',
              estimatedTime: 40,
              order: 2,
              prerequisites: ['linear_equations'],
              contentTypes: ['videos', 'simulations', 'quizzes', 'experiments'],
              learningObjectives: [
                'Solve quadratic equations using various methods',
                'Understand the quadratic formula',
                'Graph parabolas',
                'Find vertex and axis of symmetry'
              ]
            },
            {
              id: 'systems_equations',
              name: 'Systems of Equations',
              description: 'Solve systems of linear and non-linear equations',
              difficulty: 'medium',
              estimatedTime: 35,
              order: 3,
              prerequisites: ['linear_equations'],
              contentTypes: ['videos', 'simulations', 'quizzes'],
              learningObjectives: [
                'Solve systems using substitution',
                'Solve systems using elimination',
                'Graph systems of equations',
                'Interpret solutions in context'
              ]
            }
          ]
        },
        geometry: {
          id: 'geometry',
          name: 'Geometry',
          description: 'Study shapes, sizes, properties of figures and spaces',
          difficulty: 'medium',
          estimatedTime: 50,
          contentTypes: ['videos', 'simulations', 'experiments', 'readings'],
          prerequisites: ['basic_arithmetic'],
          chapters: [
            {
              id: 'basic_shapes',
              name: 'Basic Shapes and Properties',
              description: 'Learn about triangles, quadrilaterals, and circles',
              difficulty: 'easy',
              estimatedTime: 25,
              order: 1,
              contentTypes: ['videos', 'simulations'],
              learningObjectives: [
                'Identify different types of triangles',
                'Calculate perimeter and area',
                'Understand angle relationships',
                'Recognize congruent figures'
              ]
            },
            {
              id: 'coordinate_geometry',
              name: 'Coordinate Geometry',
              description: 'Explore geometry in the coordinate plane',
              difficulty: 'medium',
              estimatedTime: 35,
              order: 2,
              prerequisites: ['basic_shapes'],
              contentTypes: ['videos', 'simulations', 'quizzes'],
              learningObjectives: [
                'Plot points on coordinate plane',
                'Calculate distance between points',
                'Find midpoint of line segments',
                'Understand slope and equations of lines'
              ]
            },
            {
              id: 'solid_geometry',
              name: 'Solid Geometry',
              description: 'Study three-dimensional shapes and their properties',
              difficulty: 'hard',
              estimatedTime: 40,
              order: 3,
              prerequisites: ['basic_shapes', 'coordinate_geometry'],
              contentTypes: ['videos', 'simulations', 'experiments', 'models'],
              learningObjectives: [
                'Calculate volume of 3D shapes',
                'Find surface area of solids',
                'Understand cross-sections',
                'Apply 3D geometry to real problems'
              ]
            }
          ]
        },
        calculus: {
          id: 'calculus',
          name: 'Calculus',
          description: 'Introduction to limits, derivatives, and integrals',
          difficulty: 'hard',
          estimatedTime: 80,
          contentTypes: ['videos', 'simulations', 'quizzes', 'readings'],
          prerequisites: ['algebra', 'geometry'],
          chapters: [
            {
              id: 'limits',
              name: 'Limits and Continuity',
              description: 'Understand the concept of limits and continuous functions',
              difficulty: 'hard',
              estimatedTime: 45,
              order: 1,
              contentTypes: ['videos', 'simulations', 'quizzes'],
              learningObjectives: [
                'Evaluate limits algebraically',
                'Understand continuity',
                'Apply limit theorems',
                'Identify discontinuities'
              ]
            },
            {
              id: 'derivatives',
              name: 'Derivatives',
              description: 'Learn differentiation and its applications',
              difficulty: 'hard',
              estimatedTime: 50,
              order: 2,
              prerequisites: ['limits'],
              contentTypes: ['videos', 'simulations', 'quizzes', 'experiments'],
              learningObjectives: [
                'Apply differentiation rules',
                'Find critical points',
                'Solve optimization problems',
                'Understand rate of change'
              ]
            }
          ]
        }
      }
    },
  
    physics: {
      id: 'physics',
      name: 'Physics',
      description: 'Discover the fundamental laws governing matter, energy, and their interactions',
      icon: 'Atom',
      color: '#EF4444', // Red
      difficulty: 'hard',
      estimatedHours: 100,
      prerequisites: ['mathematics'],
      topics: {
        mechanics: {
          id: 'mechanics',
          name: 'Classical Mechanics',
          description: 'Study motion, forces, and energy in mechanical systems',
          difficulty: 'medium',
          estimatedTime: 60,
          contentTypes: ['videos', 'simulations', 'experiments', 'readings'],
          prerequisites: ['algebra'],
          chapters: [
            {
              id: 'kinematics',
              name: 'Kinematics',
              description: 'Describe motion without considering its causes',
              difficulty: 'medium',
              estimatedTime: 35,
              order: 1,
              contentTypes: ['videos', 'simulations', 'experiments'],
              learningObjectives: [
                'Calculate velocity and acceleration',
                'Analyze motion graphs',
                'Apply kinematic equations',
                'Understand projectile motion'
              ]
            },
            {
              id: 'forces',
              name: 'Forces and Newton\'s Laws',
              description: 'Understand forces and their effects on motion',
              difficulty: 'medium',
              estimatedTime: 40,
              order: 2,
              prerequisites: ['kinematics'],
              contentTypes: ['videos', 'simulations', 'experiments', 'quizzes'],
              learningObjectives: [
                'Apply Newton\'s three laws',
                'Analyze force diagrams',
                'Calculate friction forces',
                'Solve dynamics problems'
              ]
            },
            {
              id: 'energy_momentum',
              name: 'Energy and Momentum',
              description: 'Explore conservation of energy and momentum',
              difficulty: 'hard',
              estimatedTime: 45,
              order: 3,
              prerequisites: ['forces'],
              contentTypes: ['videos', 'simulations', 'experiments', 'quizzes'],
              learningObjectives: [
                'Apply conservation of energy',
                'Calculate work and power',
                'Understand momentum conservation',
                'Analyze collisions'
              ]
            }
          ]
        },
        waves: {
          id: 'waves',
          name: 'Waves and Sound',
          description: 'Study wave properties, sound, and wave phenomena',
          difficulty: 'medium',
          estimatedTime: 40,
          contentTypes: ['videos', 'simulations', 'experiments', 'readings'],
          prerequisites: ['mechanics'],
          chapters: [
            {
              id: 'wave_properties',
              name: 'Wave Properties',
              description: 'Understand amplitude, frequency, wavelength, and speed',
              difficulty: 'medium',
              estimatedTime: 25,
              order: 1,
              contentTypes: ['videos', 'simulations', 'experiments'],
              learningObjectives: [
                'Identify wave characteristics',
                'Calculate wave speed',
                'Understand wave types',
                'Analyze wave behavior'
              ]
            },
            {
              id: 'sound_waves',
              name: 'Sound Waves',
              description: 'Explore sound production, transmission, and perception',
              difficulty: 'medium',
              estimatedTime: 30,
              order: 2,
              prerequisites: ['wave_properties'],
              contentTypes: ['videos', 'simulations', 'experiments', 'quizzes'],
              learningObjectives: [
                'Understand sound production',
                'Calculate sound intensity',
                'Analyze Doppler effect',
                'Study musical instruments'
              ]
            }
          ]
        }
      }
    },
  
    chemistry: {
      id: 'chemistry',
      name: 'Chemistry',
      description: 'Explore the composition, structure, properties, and reactions of matter',
      icon: 'Flask',
      color: '#10B981', // Green
      difficulty: 'medium',
      estimatedHours: 90,
      prerequisites: ['mathematics'],
      topics: {
        atomic_structure: {
          id: 'atomic_structure',
          name: 'Atomic Structure',
          description: 'Learn about atoms, electrons, and the periodic table',
          difficulty: 'medium',
          estimatedTime: 45,
          contentTypes: ['videos', 'simulations', 'experiments', 'readings'],
          prerequisites: [],
          chapters: [
            {
              id: 'atomic_theory',
              name: 'Atomic Theory',
              description: 'Understand the development of atomic models',
              difficulty: 'easy',
              estimatedTime: 25,
              order: 1,
              contentTypes: ['videos', 'simulations', 'readings'],
              learningObjectives: [
                'Describe historical atomic models',
                'Understand atomic structure',
                'Identify subatomic particles',
                'Explain electron configuration'
              ]
            },
            {
              id: 'periodic_table',
              name: 'Periodic Table',
              description: 'Explore element organization and periodic trends',
              difficulty: 'medium',
              estimatedTime: 35,
              order: 2,
              prerequisites: ['atomic_theory'],
              contentTypes: ['videos', 'simulations', 'quizzes', 'readings'],
              learningObjectives: [
                'Navigate the periodic table',
                'Understand periodic trends',
                'Predict element properties',
                'Explain electron configurations'
              ]
            }
          ]
        },
        chemical_bonding: {
          id: 'chemical_bonding',
          name: 'Chemical Bonding',
          description: 'Study how atoms connect to form compounds',
          difficulty: 'medium',
          estimatedTime: 40,
          contentTypes: ['videos', 'simulations', 'experiments', 'readings'],
          prerequisites: ['atomic_structure'],
          chapters: [
            {
              id: 'ionic_bonding',
              name: 'Ionic Bonding',
              description: 'Understand electron transfer and ionic compounds',
              difficulty: 'medium',
              estimatedTime: 25,
              order: 1,
              contentTypes: ['videos', 'simulations', 'experiments'],
              learningObjectives: [
                'Explain ionic bond formation',
                'Predict ionic compound formulas',
                'Understand lattice structures',
                'Calculate lattice energy'
              ]
            },
            {
              id: 'covalent_bonding',
              name: 'Covalent Bonding',
              description: 'Learn about electron sharing and molecular compounds',
              difficulty: 'medium',
              estimatedTime: 30,
              order: 2,
              contentTypes: ['videos', 'simulations', 'experiments', 'quizzes'],
              learningObjectives: [
                'Draw Lewis structures',
                'Predict molecular geometry',
                'Understand bond polarity',
                'Explain hybridization'
              ]
            }
          ]
        }
      }
    },
  
    biology: {
      id: 'biology',
      name: 'Biology',
      description: 'Study living organisms and their vital processes',
      icon: 'Dna',
      color: '#8B5CF6', // Purple
      difficulty: 'medium',
      estimatedHours: 85,
      prerequisites: ['chemistry'],
      topics: {
        cell_biology: {
          id: 'cell_biology',
          name: 'Cell Biology',
          description: 'Explore the basic unit of life - the cell',
          difficulty: 'medium',
          estimatedTime: 50,
          contentTypes: ['videos', 'simulations', 'experiments', 'readings'],
          prerequisites: [],
          chapters: [
            {
              id: 'cell_structure',
              name: 'Cell Structure and Function',
              description: 'Learn about cellular components and their roles',
              difficulty: 'medium',
              estimatedTime: 30,
              order: 1,
              contentTypes: ['videos', 'simulations', 'experiments'],
              learningObjectives: [
                'Identify cell organelles',
                'Understand organelle functions',
                'Compare prokaryotic and eukaryotic cells',
                'Analyze cell membrane structure'
              ]
            },
            {
              id: 'cellular_processes',
              name: 'Cellular Processes',
              description: 'Study metabolism, respiration, and photosynthesis',
              difficulty: 'hard',
              estimatedTime: 40,
              order: 2,
              prerequisites: ['cell_structure'],
              contentTypes: ['videos', 'simulations', 'experiments', 'quizzes'],
              learningObjectives: [
                'Understand cellular respiration',
                'Explain photosynthesis process',
                'Analyze enzyme function',
                'Study cell division'
              ]
            }
          ]
        },
        genetics: {
          id: 'genetics',
          name: 'Genetics',
          description: 'Understand inheritance and genetic variation',
          difficulty: 'hard',
          estimatedTime: 55,
          contentTypes: ['videos', 'simulations', 'experiments', 'readings'],
          prerequisites: ['cell_biology'],
          chapters: [
            {
              id: 'mendelian_genetics',
              name: 'Mendelian Genetics',
              description: 'Learn basic principles of inheritance',
              difficulty: 'medium',
              estimatedTime: 35,
              order: 1,
              contentTypes: ['videos', 'simulations', 'quizzes'],
              learningObjectives: [
                'Understand dominant and recessive traits',
                'Use Punnett squares',
                'Apply Mendel\'s laws',
                'Solve genetic problems'
              ]
            },
            {
              id: 'molecular_genetics',
              name: 'Molecular Genetics',
              description: 'Explore DNA, RNA, and protein synthesis',
              difficulty: 'hard',
              estimatedTime: 45,
              order: 2,
              prerequisites: ['mendelian_genetics'],
              contentTypes: ['videos', 'simulations', 'experiments', 'quizzes'],
              learningObjectives: [
                'Understand DNA structure',
                'Explain transcription and translation',
                'Analyze genetic mutations',
                'Study gene regulation'
              ]
            }
          ]
        }
      }
    }
  };
  
  // Learning pathways that connect topics across subjects
  export const learningPathways = {
    mathematics_foundation: {
      id: 'mathematics_foundation',
      name: 'Mathematics Foundation',
      description: 'Essential math skills for science and engineering',
      subjects: ['mathematics'],
      requiredTopics: ['algebra', 'geometry'],
      estimatedHours: 95,
      difficulty: 'medium'
    },
    
    physics_preparation: {
      id: 'physics_preparation',
      name: 'Physics Preparation',
      description: 'Mathematical foundation required for physics',
      subjects: ['mathematics', 'physics'],
      requiredTopics: ['algebra', 'calculus', 'mechanics'],
      estimatedHours: 140,
      difficulty: 'hard'
    },
    
    chemistry_fundamentals: {
      id: 'chemistry_fundamentals',
      name: 'Chemistry Fundamentals',
      description: 'Core chemistry concepts and mathematical tools',
      subjects: ['mathematics', 'chemistry'],
      requiredTopics: ['algebra', 'atomic_structure', 'chemical_bonding'],
      estimatedHours: 125,
      difficulty: 'medium'
    },
    
    life_sciences: {
      id: 'life_sciences',
      name: 'Life Sciences Track',
      description: 'Biology with supporting chemistry knowledge',
      subjects: ['chemistry', 'biology'],
      requiredTopics: ['atomic_structure', 'chemical_bonding', 'cell_biology', 'genetics'],
      estimatedHours: 175,
      difficulty: 'medium'
    },
    
    stem_comprehensive: {
      id: 'stem_comprehensive',
      name: 'Comprehensive STEM',
      description: 'Complete foundation in all STEM subjects',
      subjects: ['mathematics', 'physics', 'chemistry', 'biology'],
      requiredTopics: ['algebra', 'geometry', 'calculus', 'mechanics', 'waves', 'atomic_structure', 'chemical_bonding', 'cell_biology', 'genetics'],
      estimatedHours: 395,
      difficulty: 'expert'
    }
  };
  
  // Topic dependencies and prerequisites mapping
  export const dependencyGraph = {
    // Mathematics dependencies
    'quadratic_equations': ['linear_equations'],
    'systems_equations': ['linear_equations'],
    'coordinate_geometry': ['basic_shapes'],
    'solid_geometry': ['basic_shapes', 'coordinate_geometry'],
    'limits': ['algebra', 'geometry'],
    'derivatives': ['limits'],
    
    // Physics dependencies
    'forces': ['kinematics'],
    'energy_momentum': ['forces'],
    'sound_waves': ['wave_properties'],
    
    // Chemistry dependencies
    'periodic_table': ['atomic_theory'],
    'ionic_bonding': ['periodic_table'],
    'covalent_bonding': ['periodic_table'],
    
    // Biology dependencies
    'cellular_processes': ['cell_structure'],
    'molecular_genetics': ['mendelian_genetics'],
    
    // Cross-subject dependencies
    'mechanics': ['algebra'],
    'waves': ['mechanics'],
    'chemical_bonding': ['atomic_structure'],
    'genetics': ['cell_biology']
  };
  
  // Utility functions for curriculum navigation
  export const getCurriculumUtils = () => {
    /**
     * Get all chapters for a subject
     */
    const getSubjectChapters = (subjectId) => {
      const subject = curriculumMap[subjectId];
      if (!subject) return [];
      
      const chapters = [];
      Object.values(subject.topics).forEach(topic => {
        if (topic.chapters) {
          chapters.push(...topic.chapters.map(chapter => ({
            ...chapter,
            topicId: topic.id,
            subjectId
          })));
        }
      });
      
      return chapters.sort((a, b) => a.order - b.order);
    };
  
    /**
     * Get prerequisites for a topic
     */
    const getTopicPrerequisites = (topicId) => {
      return dependencyGraph[topicId] || [];
    };
  
    /**
     * Check if a topic is unlocked based on completed prerequisites
     */
    const isTopicUnlocked = (topicId, completedTopics = []) => {
      const prerequisites = getTopicPrerequisites(topicId);
      return prerequisites.every(prereq => completedTopics.includes(prereq));
    };
  
    /**
     * Get recommended next topics based on completed topics
     */
    const getNextRecommendedTopics = (completedTopics = []) => {
      const recommendations = [];
      
      // Check all topics to see which ones are newly unlocked
      Object.values(curriculumMap).forEach(subject => {
        Object.values(subject.topics).forEach(topic => {
          if (!completedTopics.includes(topic.id) && isTopicUnlocked(topic.id, completedTopics)) {
            recommendations.push({
              ...topic,
              subjectId: subject.id,
              reason: 'Prerequisites completed'
            });
          }
        });
      });
      
      return recommendations;
    };
  
    /**
     * Get learning pathway progress
     */
    const getPathwayProgress = (pathwayId, completedTopics = []) => {
      const pathway = learningPathways[pathwayId];
      if (!pathway) return null;
      
      const totalTopics = pathway.requiredTopics.length;
      const completedRequiredTopics = pathway.requiredTopics.filter(topic => 
        completedTopics.includes(topic)
      ).length;
      
      return {
        ...pathway,
        progress: (completedRequiredTopics / totalTopics) * 100,
        completedTopics: completedRequiredTopics,
        totalTopics
      };
    };
  
    return {
      getSubjectChapters,
      getTopicPrerequisites,
      isTopicUnlocked,
      getNextRecommendedTopics,
      getPathwayProgress
    };
  };
  
  export default {
    curriculumMap,
    learningPathways,
    dependencyGraph,
    getCurriculumUtils
  };