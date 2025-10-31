module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define('Question', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    subjectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'subjects',
        key: 'id'
      }
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: false
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('multiple-choice', 'theory'),
      defaultValue: 'multiple-choice'
    },
    options: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    correctAnswer: {
      type: DataTypes.STRING
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      defaultValue: 'medium'
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    imageUrl: {
      type: DataTypes.STRING
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    usageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    correctCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    createdBy: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'questions',
    timestamps: true,
    indexes: [
      {
        fields: ['subjectId', 'topic', 'difficulty']
      }
    ]
  });

  Question.associate = (models) => {
    Question.belongsTo(models.Subject, {
      foreignKey: 'subjectId',
      as: 'subject'
    });
    Question.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  };

  return Question;
};