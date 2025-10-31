module.exports = (sequelize, DataTypes) => {
  const Analytics = sequelize.define('Analytics', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    totalTests: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    averageScore: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    totalStudyTime: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    currentStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    longestStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastStudyDate: {
      type: DataTypes.DATE
    },
    subjectPerformance: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    topicMastery: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    weeklyProgress: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    strengths: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    weaknesses: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    recommendations: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    }
  }, {
    tableName: 'analytics',
    timestamps: true
  });

  Analytics.associate = (models) => {
    Analytics.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Analytics;
};