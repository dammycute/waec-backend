require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('student', 'teacher', 'admin', 'school'),
        defaultValue: 'student'
      },
      school: {
        type: Sequelize.STRING
      },
      class: {
        type: Sequelize.ENUM('SS1', 'SS2', 'SS3')
      },
      subscriptionPlan: {
        type: Sequelize.ENUM('free', 'premium', 'school'),
        defaultValue: 'free'
      },
      subscriptionStatus: {
        type: Sequelize.ENUM('active', 'inactive', 'expired'),
        defaultValue: 'active'
      },
      subscriptionStartDate: {
        type: Sequelize.DATE
      },
      subscriptionEndDate: {
        type: Sequelize.DATE
      },
      avatar: {
        type: Sequelize.STRING,
        defaultValue: 'default-avatar.png'
      },
      emailNotifications: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      smsNotifications: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      testReminders: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      weeklyReports: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      performanceAlerts: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      resetPasswordToken: {
        type: Sequelize.STRING
      },
      resetPasswordExpire: {
        type: Sequelize.DATE
      },
      emailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      verificationToken: {
        type: Sequelize.STRING
      },
      lastLogin: {
        type: Sequelize.DATE
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create subjects table
    await queryInterface.createTable('subjects', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT
      },
      icon: {
        type: Sequelize.STRING
      },
      color: {
        type: Sequelize.STRING
      },
      topics: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create questions table
    await queryInterface.createTable('questions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      subjectId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'subjects',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      topic: {
        type: Sequelize.STRING,
        allowNull: false
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('multiple-choice', 'theory'),
        defaultValue: 'multiple-choice'
      },
      options: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      correctAnswer: {
        type: Sequelize.STRING
      },
      explanation: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      difficulty: {
        type: Sequelize.ENUM('easy', 'medium', 'hard'),
        defaultValue: 'medium'
      },
      points: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      imageUrl: {
        type: Sequelize.STRING
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      usageCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      correctCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdBy: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create tests table
    await queryInterface.createTable('tests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      subjectId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'subjects',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('quick', 'subject', 'mock'),
        defaultValue: 'subject'
      },
      questions: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        defaultValue: []
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      totalQuestions: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      totalPoints: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      passingScore: {
        type: Sequelize.INTEGER,
        defaultValue: 50
      },
      difficulty: {
        type: Sequelize.ENUM('easy', 'medium', 'hard', 'mixed'),
        defaultValue: 'mixed'
      },
      instructions: {
        type: Sequelize.TEXT
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      scheduledFor: {
        type: Sequelize.DATE
      },
      scheduledBy: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      assignedTo: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        defaultValue: []
      },
      class: {
        type: Sequelize.STRING
      },
      createdBy: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create test_attempts table
    await queryInterface.createTable('test_attempts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      testId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tests',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      answers: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      percentage: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      totalQuestions: {
        type: Sequelize.INTEGER
      },
      correctAnswers: {
        type: Sequelize.INTEGER
      },
      incorrectAnswers: {
        type: Sequelize.INTEGER
      },
      unanswered: {
        type: Sequelize.INTEGER
      },
      timeTaken: {
        type: Sequelize.INTEGER
      },
      startedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('completed', 'abandoned', 'in-progress'),
        defaultValue: 'completed'
      },
      topicPerformance: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create analytics table
    await queryInterface.createTable('analytics', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      totalTests: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      averageScore: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      totalStudyTime: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      currentStreak: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      longestStreak: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      lastStudyDate: {
        type: Sequelize.DATE
      },
      subjectPerformance: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      topicMastery: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      weeklyProgress: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      strengths: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      weaknesses: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      recommendations: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create notifications table
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('test_reminder', 'performance_alert', 'achievement', 'system'),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      link: {
        type: Sequelize.STRING
      },
      icon: {
        type: Sequelize.STRING
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes
    await queryInterface.addIndex('questions', ['subjectId', 'topic', 'difficulty']);
    await queryInterface.addIndex('tests', ['subjectId', 'type', 'isActive']);
    await queryInterface.addIndex('test_attempts', ['userId', 'testId', 'createdAt']);
    await queryInterface.addIndex('notifications', ['userId', 'createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('analytics');
    await queryInterface.dropTable('test_attempts');
    await queryInterface.dropTable('tests');
    await queryInterface.dropTable('questions');
    await queryInterface.dropTable('subjects');
    await queryInterface.dropTable('users');
  }
};