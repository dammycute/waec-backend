const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Full name is required' },
        len: {
          args: [3, 100],
          msg: 'Full name must be between 3 and 100 characters'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email address already exists'
      },
      validate: {
        isEmail: { msg: 'Please provide a valid email' },
        notEmpty: { msg: 'Email is required' }
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Phone number already exists'
      },
      validate: {
        notEmpty: { msg: 'Phone number is required' },
        is: {
          args: /^(\+234|0)[789]\d{9}$/,
          msg: 'Please provide a valid Nigerian phone number'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password is required' },
        len: {
          args: [8, 100],
          msg: 'Password must be at least 8 characters'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('student', 'teacher', 'admin', 'school'),
      defaultValue: 'student'
    },
    school: {
      type: DataTypes.STRING
    },
    class: {
      type: DataTypes.ENUM('SS1', 'SS2', 'SS3')
    },
    subscriptionPlan: {
      type: DataTypes.ENUM('free', 'premium', 'school'),
      defaultValue: 'free'
    },
    subscriptionStatus: {
      type: DataTypes.ENUM('active', 'inactive', 'expired'),
      defaultValue: 'active'
    },
    subscriptionStartDate: {
      type: DataTypes.DATE
    },
    subscriptionEndDate: {
      type: DataTypes.DATE
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: 'default-avatar.png'
    },
    emailNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    smsNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    testReminders: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    weeklyReports: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    performanceAlerts: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    resetPasswordToken: {
      type: DataTypes.STRING
    },
    resetPasswordExpire: {
      type: DataTypes.DATE
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationToken: {
      type: DataTypes.STRING
    },
    lastLogin: {
      type: DataTypes.DATE
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // Instance methods
  User.prototype.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  User.prototype.getSignedJwtToken = function() {
    return jwt.sign(
      { id: this.id, role: this.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  };

  User.prototype.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    this.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    return resetToken;
  };

  // Associations
  User.associate = (models) => {
    User.hasMany(models.TestAttempt, {
      foreignKey: 'userId',
      as: 'testAttempts'
    });
    User.hasOne(models.Analytics, {
      foreignKey: 'userId',
      as: 'analytics'
    });
    User.hasMany(models.Notification, {
      foreignKey: 'userId',
      as: 'notifications'
    });
  };

  return User;
};