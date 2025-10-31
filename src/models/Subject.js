module.exports = (sequelize, DataTypes) => {
  const Subject = sequelize.define('Subject', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isIn: {
          args: [['Mathematics', 'English', 'Biology', 'Chemistry', 'Physics', 'Economics', 'Government', 'Literature']],
          msg: 'Invalid subject name'
        }
      }
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    },
    icon: {
      type: DataTypes.STRING
    },
    color: {
      type: DataTypes.STRING
    },
    topics: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'subjects',
    timestamps: true
  });

  Subject.associate = (models) => {
    Subject.hasMany(models.Question, {
      foreignKey: 'subjectId',
      as: 'questions'
    });
    Subject.hasMany(models.Test, {
      foreignKey: 'subjectId',
      as: 'tests'
    });
  };

  return Subject;
};