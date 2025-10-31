require('dotenv').config();
const { sequelize, User, Subject, Question, Analytics } = require('../models');

const subjects = [
  {
    name: 'Mathematics',
    code: 'MATH',
    description: 'Mathematics for WAEC',
    icon: 'calculator',
    color: '#3B82F6',
    topics: [
      { name: 'Algebra', description: 'Linear equations, quadratic equations' },
      { name: 'Geometry', description: 'Shapes, angles, theorems' },
      { name: 'Statistics', description: 'Mean, median, mode, probability' }
    ]
  },
  {
    name: 'English',
    code: 'ENG',
    description: 'English Language for WAEC',
    icon: 'book',
    color: '#10B981',
    topics: [
      { name: 'Comprehension', description: 'Reading and understanding' },
      { name: 'Grammar', description: 'Parts of speech, tenses' }
    ]
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Database synchronized');

    // Create admin user
    const admin = await User.create({
      fullName: 'System Administrator',
      email: 'admin@waeccbt.com',
      phone: '+2348012345678',
      password: 'Admin@123',
      role: 'admin',
      subscriptionPlan: 'premium',
      subscriptionStatus: 'active',
      emailVerified: true
    });
    console.log('✅ Admin user created');

    // Create sample student
    const student = await User.create({
      fullName: 'Ada Okonkwo',
      email: 'ada@student.com',
      phone: '+2348087654321',
      password: 'Student@123',
      role: 'student',
      school: 'Government Secondary School, Ibadan',
      class: 'SS3',
      subscriptionPlan: 'premium',
      subscriptionStatus: 'active',
      emailVerified: true
    });
    console.log('✅ Sample student created');

    // Create analytics for student
    await Analytics.create({ userId: student.id });

    // Create subjects
    const createdSubjects = await Subject.bulkCreate(subjects);
    console.log(`✅ ${createdSubjects.length} subjects created`);

    // Create sample questions
    const mathSubject = createdSubjects.find(s => s.name === 'Mathematics');
    
    const questions = [
      {
        subjectId: mathSubject.id,
        topic: 'Algebra',
        text: 'If x + 5 = 12, what is the value of x?',
        type: 'multiple-choice',
        options: [
          { id: 'A', text: '7' },
          { id: 'B', text: '17' },
          { id: 'C', text: '5' },
          { id: 'D', text: '12' }
        ],
        correctAnswer: 'A',
        explanation: 'To solve for x, subtract 5 from both sides: x = 12 - 5 = 7',
        difficulty: 'easy',
        points: 1,
        createdBy: admin.id
      },
      {
        subjectId: mathSubject.id,
        topic: 'Algebra',
        text: 'What is 15% of 200?',
        type: 'multiple-choice',
        options: [
          { id: 'A', text: '15' },
          { id: 'B', text: '30' },
          { id: 'C', text: '25' },
          { id: 'D', text: '20' }
        ],
        correctAnswer: 'B',
        explanation: 'To find 15% of 200: (15/100) × 200 = 30',
        difficulty: 'easy',
        points: 1,
        createdBy: admin.id
      }
    ];

    await Question.bulkCreate(questions);
    console.log(`✅ ${questions.length} sample questions created`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Admin: admin@waeccbt.com / Admin@123');
    console.log('Student: ada@student.com / Student@123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();