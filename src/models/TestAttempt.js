module.exports = (sequelize, DataTypes) => {
  const TestAttempt = sequelize.define('TestAttempt', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    testId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tests',
        key: 'id'
      }
    },
    answers: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    percentage: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    totalQuestions: {
      type: DataTypes.INTEGER
    },
    correctAnswers: {
      type: DataTypes.INTEGER
    },
    incorrectAnswers: {
      type: DataTypes.INTEGER
    },
    unanswered: {
      type: DataTypes.INTEGER
    },
    timeTaken: {
      type: DataTypes.INTEGER
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('completed', 'abandoned', 'in-progress'),
      defaultValue: 'completed'
    },
    topicPerformance: {
      type: DataTypes.JSONB,
      defaultValue: []
    }
  }, {
    tableName: 'test_attempts',
    timestamps: true,
    indexes: [
      {
        fields: ['userId', 'testId', 'createdAt']
      },
      {
        fields: ['userId', 'createdAt']
      }
    ]
  });

  TestAttempt.associate = (models) => {
    TestAttempt.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    TestAttempt.belongsTo(models.Test, {
      foreignKey: 'testId',
      as: 'test'
    });
  };

  return TestAttempt;
};