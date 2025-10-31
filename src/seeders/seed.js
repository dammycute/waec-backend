// backend/src/seeders/seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Subject, Question, Analytics } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await sequelize.query('TRUNCATE TABLE notifications, analytics, test_attempts, tests, questions, subjects, users RESTART IDENTITY CASCADE');
    console.log('✅ Existing data cleared\n');

    // 1. Create Admin User
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await User.create({
      fullName: 'System Administrator',
      email: 'admin@waeccbt.com',
      phone: '+2348012345678',
      password: adminPassword,
      role: 'admin',
      subscriptionPlan: 'premium',
      subscriptionStatus: 'active',
      subscriptionStartDate: new Date(),
      emailVerified: true,
      isActive: true
    });
    console.log('✅ Admin user created');
    console.log('   Email: admin@waeccbt.com');
    console.log('   Password: Admin@123\n');

    // 2. Create Teacher User
    console.log('👨‍🏫 Creating teacher user...');
    const teacherPassword = await bcrypt.hash('Teacher@123', 10);
    const teacher = await User.create({
      fullName: 'Mr. Okafor Johnson',
      email: 'teacher@waeccbt.com',
      phone: '+2348087654321',
      password: teacherPassword,
      role: 'teacher',
      school: 'Bright Future Academy',
      subscriptionPlan: 'school',
      subscriptionStatus: 'active',
      subscriptionStartDate: new Date(),
      emailVerified: true,
      isActive: true
    });
    console.log('✅ Teacher user created');
    console.log('   Email: teacher@waeccbt.com');
    console.log('   Password: Teacher@123\n');

    // 3. Create Sample Students
    console.log('👨‍🎓 Creating sample students...');
    const studentPassword = await bcrypt.hash('Student@123', 10);
    
    const students = await User.bulkCreate([
      {
        fullName: 'Ada Okonkwo',
        email: 'ada@student.com',
        phone: '+2348011111111',
        password: studentPassword,
        role: 'student',
        school: 'Government Secondary School, Ibadan',
        class: 'SS3',
        subscriptionPlan: 'premium',
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        emailVerified: true,
        isActive: true
      },
      {
        fullName: 'Chioma Eze',
        email: 'chioma@student.com',
        phone: '+2348022222222',
        password: studentPassword,
        role: 'student',
        school: 'Government Secondary School, Ibadan',
        class: 'SS3',
        subscriptionPlan: 'free',
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        emailVerified: true,
        isActive: true
      },
      {
        fullName: 'Emeka Nwosu',
        email: 'emeka@student.com',
        phone: '+2348033333333',
        password: studentPassword,
        role: 'student',
        school: 'Bright Future Academy',
        class: 'SS2',
        subscriptionPlan: 'premium',
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        emailVerified: true,
        isActive: true
      }
    ]);
    console.log(`✅ ${students.length} students created`);
    console.log('   All student passwords: Student@123\n');

    // Create analytics for students
    console.log('📊 Creating analytics for students...');
    for (const student of students) {
      await Analytics.create({
        userId: student.id,
        totalTests: 0,
        averageScore: 0,
        totalStudyTime: 0,
        currentStreak: 0,
        longestStreak: 0
      });
    }
    console.log('✅ Analytics created for all students\n');

    // 4. Create Subjects
    console.log('📚 Creating subjects...');
    const subjects = await Subject.bulkCreate([
      {
        name: 'Mathematics',
        code: 'MATH',
        description: 'Mathematics for WAEC - Covers algebra, geometry, statistics, and more',
        icon: 'calculator',
        color: '#3B82F6',
        topics: [
          { name: 'Algebra', description: 'Linear equations, quadratic equations, inequalities' },
          { name: 'Geometry', description: 'Shapes, angles, theorems, mensuration' },
          { name: 'Statistics', description: 'Mean, median, mode, probability, data analysis' },
          { name: 'Trigonometry', description: 'Sine, cosine, tangent, angles' },
          { name: 'Calculus', description: 'Differentiation, integration basics' }
        ],
        isActive: true
      },
      {
        name: 'English',
        code: 'ENG',
        description: 'English Language for WAEC - Grammar, comprehension, and composition',
        icon: 'book',
        color: '#10B981',
        topics: [
          { name: 'Comprehension', description: 'Reading and understanding passages' },
          { name: 'Grammar', description: 'Parts of speech, tenses, clauses' },
          { name: 'Essay Writing', description: 'Narrative, descriptive, argumentative essays' },
          { name: 'Summary', description: 'Summarizing passages effectively' },
          { name: 'Vocabulary', description: 'Word usage, synonyms, antonyms' }
        ],
        isActive: true
      },
      {
        name: 'Biology',
        code: 'BIO',
        description: 'Biology for WAEC - Study of living organisms and life processes',
        icon: 'microscope',
        color: '#8B5CF6',
        topics: [
          { name: 'Cell Biology', description: 'Cell structure, function, division' },
          { name: 'Genetics', description: 'DNA, heredity, variation, evolution' },
          { name: 'Ecology', description: 'Ecosystems, food chains, conservation' },
          { name: 'Human Biology', description: 'Body systems, nutrition, health' },
          { name: 'Plant Biology', description: 'Plant structure, photosynthesis, reproduction' }
        ],
        isActive: true
      },
      {
        name: 'Chemistry',
        code: 'CHEM',
        description: 'Chemistry for WAEC - Study of matter and its properties',
        icon: 'flask',
        color: '#F97316',
        topics: [
          { name: 'Organic Chemistry', description: 'Carbon compounds, hydrocarbons, polymers' },
          { name: 'Inorganic Chemistry', description: 'Elements, compounds, periodic table' },
          { name: 'Physical Chemistry', description: 'States of matter, energy changes' },
          { name: 'Chemical Reactions', description: 'Equations, rates, equilibrium' },
          { name: 'Acids and Bases', description: 'pH, neutralization, salts' }
        ],
        isActive: true
      },
      {
        name: 'Physics',
        code: 'PHY',
        description: 'Physics for WAEC - Study of matter, energy, and their interactions',
        icon: 'zap',
        color: '#EF4444',
        topics: [
          { name: 'Mechanics', description: 'Motion, forces, work, energy' },
          { name: 'Electricity', description: 'Current, voltage, resistance, circuits' },
          { name: 'Waves', description: 'Sound, light, electromagnetic waves' },
          { name: 'Heat', description: 'Temperature, thermal expansion, heat transfer' },
          { name: 'Modern Physics', description: 'Radioactivity, atomic structure' }
        ],
        isActive: true
      },
      {
        name: 'Economics',
        code: 'ECON',
        description: 'Economics for WAEC - Study of production, distribution, and consumption',
        icon: 'trending-up',
        color: '#06B6D4',
        topics: [
          { name: 'Microeconomics', description: 'Demand, supply, markets, elasticity' },
          { name: 'Macroeconomics', description: 'National income, inflation, unemployment' },
          { name: 'Production', description: 'Factors of production, costs, revenue' },
          { name: 'Money and Banking', description: 'Functions of money, banking system' }
        ],
        isActive: true
      },
      {
        name: 'Government',
        code: 'GOVT',
        description: 'Government for WAEC - Study of political systems and governance',
        icon: 'landmark',
        color: '#A855F7',
        topics: [
          { name: 'Political Systems', description: 'Democracy, dictatorship, federalism' },
          { name: 'Constitution', description: 'Types, features, amendment' },
          { name: 'Rights and Duties', description: 'Fundamental human rights, citizenship' },
          { name: 'International Relations', description: 'Foreign policy, international organizations' }
        ],
        isActive: true
      },
      {
        name: 'Literature',
        code: 'LIT',
        description: 'Literature in English for WAEC - Study of prose, poetry, and drama',
        icon: 'book-open',
        color: '#EC4899',
        topics: [
          { name: 'Prose', description: 'Novels, short stories, analysis' },
          { name: 'Poetry', description: 'Poems, poetic devices, themes' },
          { name: 'Drama', description: 'Plays, dramatic techniques, characterization' },
          { name: 'Literary Devices', description: 'Metaphor, simile, symbolism' }
        ],
        isActive: true
      }
    ]);
    console.log(`✅ ${subjects.length} subjects created\n`);

    // 5. Create Sample Questions
    console.log('❓ Creating sample questions...');
    
    const mathSubject = subjects.find(s => s.name === 'Mathematics');
    const englishSubject = subjects.find(s => s.name === 'English');
    const biologySubject = subjects.find(s => s.name === 'Biology');

    const questions = [];

    // Mathematics Questions
    questions.push(
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
        explanation: 'To solve for x, subtract 5 from both sides of the equation: x + 5 - 5 = 12 - 5, which simplifies to x = 7.',
        difficulty: 'easy',
        points: 1,
        tags: ['equations', 'basic-algebra'],
        isActive: true,
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
        explanation: 'To find 15% of 200, multiply: (15/100) × 200 = 0.15 × 200 = 30.',
        difficulty: 'easy',
        points: 1,
        tags: ['percentage', 'arithmetic'],
        isActive: true,
        createdBy: admin.id
      },
      {
        subjectId: mathSubject.id,
        topic: 'Algebra',
        text: 'Solve for y: 2y - 8 = 10',
        type: 'multiple-choice',
        options: [
          { id: 'A', text: '6' },
          { id: 'B', text: '8' },
          { id: 'C', text: '9' },
          { id: 'D', text: '12' }
        ],
        correctAnswer: 'C',
        explanation: 'First, add 8 to both sides: 2y - 8 + 8 = 10 + 8, giving 2y = 18. Then divide both sides by 2: y = 9.',
        difficulty: 'medium',
        points: 1,
        tags: ['equations', 'algebra'],
        isActive: true,
        createdBy: admin.id
      },
      {
        subjectId: mathSubject.id,
        topic: 'Geometry',
        text: 'What is the area of a rectangle with length 8cm and width 5cm?',
        type: 'multiple-choice',
        options: [
          { id: 'A', text: '13 cm²' },
          { id: 'B', text: '26 cm²' },
          { id: 'C', text: '40 cm²' },
          { id: 'D', text: '80 cm²' }
        ],
        correctAnswer: 'C',
        explanation: 'The area of a rectangle is calculated by multiplying length by width: Area = 8 × 5 = 40 cm².',
        difficulty: 'easy',
        points: 1,
        tags: ['geometry', 'area', 'mensuration'],
        isActive: true,
        createdBy: admin.id
      },
      {
        subjectId: mathSubject.id,
        topic: 'Algebra',
        text: 'If a = 3 and b = 4, what is a² + b²?',
        type: 'multiple-choice',
        options: [
          { id: 'A', text: '7' },
          { id: 'B', text: '12' },
          { id: 'C', text: '25' },
          { id: 'D', text: '49' }
        ],
        correctAnswer: 'C',
        explanation: 'Calculate each square first: a² = 3² = 9, and b² = 4² = 16. Then add them: 9 + 16 = 25.',
        difficulty: 'medium',
        points: 1,
        tags: ['exponents', 'algebra'],
        isActive: true,
        createdBy: admin.id
      }
    );

    // English Questions
    questions.push(
      {
        subjectId: englishSubject.id,
        topic: 'Grammar',
        text: 'Which of the following is a verb?',
        type: 'multiple-choice',
        options: [
          { id: 'A', text: 'Quick' },
          { id: 'B', text: 'Run' },
          { id: 'C', text: 'Happy' },
          { id: 'D', text: 'Beautiful' }
        ],
        correctAnswer: 'B',
        explanation: 'A verb is a word that describes an action, state, or occurrence. "Run" is a verb (an action word), while the others are adjectives.',
        difficulty: 'easy',
        points: 1,
        tags: ['parts-of-speech', 'grammar'],
        isActive: true,
        createdBy: admin.id
      },
      {
        subjectId: englishSubject.id,
        topic: 'Grammar',
        text: 'Choose the correct sentence:',
        type: 'multiple-choice',
        options: [
          { id: 'A', text: 'She don\'t like ice cream' },
          { id: 'B', text: 'She doesn\'t likes ice cream' },
          { id: 'C', text: 'She doesn\'t like ice cream' },
          { id: 'D', text: 'She not like ice cream' }
        ],
        correctAnswer: 'C',
        explanation: 'The correct form is "doesn\'t like" because "she" is a third-person singular subject, requiring "doesn\'t" (does not), and the base form of the verb "like".',
        difficulty: 'easy',
        points: 1,
        tags: ['tenses', 'agreement'],
        isActive: true,
        createdBy: admin.id
      },
      {
        subjectId: englishSubject.id,
        topic: 'Vocabulary',
        text: 'What is the antonym of "difficult"?',
        type: 'multiple-choice',
        options: [
          { id: 'A', text: 'Hard' },
          { id: 'B', text: 'Easy' },
          { id: 'C', text: 'Complex' },
          { id: 'D', text: 'Challenging' }
        ],
        correctAnswer: 'B',
        explanation: 'An antonym is a word with the opposite meaning. "Easy" is the opposite of "difficult". The other options are synonyms (similar meanings).',
        difficulty: 'easy',
        points: 1,
        tags: ['vocabulary', 'antonyms'],
        isActive: true,
        createdBy: admin.id
      }
    );

    // Biology Questions
    questions.push(
      {
        subjectId: biologySubject.id,
        topic: 'Cell Biology',
        text: 'What is the powerhouse of the cell?',
        type: 'multiple-choice',
        options: [
          { id: 'A', text: 'Nucleus' },
          { id: 'B', text: 'Mitochondria' },
          { id: 'C', text: 'Ribosome' },
          { id: 'D', text: 'Chloroplast' }
        ],
        correctAnswer: 'B',
        explanation: 'The mitochondria is called the powerhouse of the cell because it produces ATP (energy) through cellular respiration.',
        difficulty: 'easy',
        points: 1,
        tags: ['cell-structure', 'organelles'],
        isActive: true,
        createdBy: admin.id
      },
      {
        subjectId: biologySubject.id,
        topic: 'Genetics',
        text: 'What does DNA stand for?',
        type: 'multiple-choice',
        options: [
          { id: 'A', text: 'Deoxyribonucleic Acid' },
          { id: 'B', text: 'Dinitrogen Acid' },
          { id: 'C', text: 'Dynamic Nuclear Acid' },
          { id: 'D', text: 'Dextrose Nucleic Acid' }
        ],
        correctAnswer: 'A',
        explanation: 'DNA stands for Deoxyribonucleic Acid. It is the molecule that carries genetic information in living organisms.',
        difficulty: 'easy',
        points: 1,
        tags: ['genetics', 'terminology'],
        isActive: true,
        createdBy: admin.id
      },
      {
        subjectId: biologySubject.id,
        topic: 'Plant Biology',
        text: 'Which process do plants use to make food?',
        type: 'multiple-choice',
        options: [
          { id: 'A', text: 'Respiration' },
          { id: 'B', text: 'Photosynthesis' },
          { id: 'C', text: 'Transpiration' },
          { id: 'D', text: 'Digestion' }
        ],
        correctAnswer: 'B',
        explanation: 'Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar (glucose).',
        difficulty: 'easy',
        points: 1,
        tags: ['photosynthesis', 'plant-biology'],
        isActive: true,
        createdBy: admin.id
      }
    );

    await Question.bulkCreate(questions);
    console.log(`✅ ${questions.length} sample questions created\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📝 LOGIN CREDENTIALS:\n');
    console.log('Admin Account:');
    console.log('  Email: admin@waeccbt.com');
    console.log('  Password: Admin@123\n');

    console.log('Teacher Account:');
    console.log('  Email: teacher@waeccbt.com');
    console.log('  Password: Teacher@123\n');

    console.log('Student Accounts:');
    console.log('  Email: ada@student.com');
    console.log('  Password: Student@123\n');
    console.log('  Email: chioma@student.com');
    console.log('  Password: Student@123\n');
    console.log('  Email: emeka@student.com');
    console.log('  Password: Student@123\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 DATABASE STATISTICS:\n');
    console.log(`  Users: ${students.length + 2} (1 admin, 1 teacher, ${students.length} students)`);
    console.log(`  Subjects: ${subjects.length}`);
    console.log(`  Questions: ${questions.length}`);
    console.log(`  Analytics: ${students.length} student profiles`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🚀 NEXT STEPS:\n');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Test the API: http://localhost:5000/api/health');
    console.log('3. Start the frontend: cd frontend && npm start');
    console.log('4. Login with any of the credentials above\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();