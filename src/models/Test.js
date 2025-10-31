module.exports = (sequelize, DataTypes) => {
  const Test = sequelize.define('Test', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subjectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'subjects',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('quick', 'subject', 'mock'),
      defaultValue: 'subject'
    },
    questions: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: []
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    totalQuestions: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    totalPoints: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    passingScore: {
      type: DataTypes.INTEGER,
      defaultValue: 50
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard', 'mixed'),
      defaultValue: 'mixed'
    },
    instructions: {
      type: DataTypes.TEXT
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    scheduledFor: {
      type: DataTypes.DATE
    },
    scheduledBy: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assignedTo: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: []
    },
    class: {
      type: DataTypes.STRING
    },
    createdBy: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'tests',
    timestamps: true,
    indexes: [
      {
        fields: ['subjectId', 'type', 'isActive']
      }
    ]
  });

  Test.associate = (models) => {
    Test.belongsTo(models.Subject, {
      foreignKey: 'subjectId',
      as: 'subject'
    });
    Test.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    Test.hasMany(models.TestAttempt, {
      foreignKey: 'testId',
      as: 'attempts'
    });
  };

  return Test;
};