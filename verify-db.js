// backend/verify-database.js
// Run this to check what's currently in your database
// Usage: node verify-database.js

require('dotenv').config();
const { sequelize, User, Subject, Question, Test, TestAttempt, Analytics } = require('./src/models');

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying Database Contents...\n');

    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');

    // Count records in each table
    const userCount = await User.count();
    const subjectCount = await Subject.count();
    const questionCount = await Question.count();
    const testCount = await Test.count();
    const attemptCount = await TestAttempt.count();
    const analyticsCount = await Analytics.count();

    console.log('📊 TABLE STATISTICS:\n');
    console.log(`Users:        ${userCount}`);
    console.log(`Subjects:     ${subjectCount}`);
    console.log(`Questions:    ${questionCount}`);
    console.log(`Tests:        ${testCount}`);
    console.log(`Attempts:     ${attemptCount}`);
    console.log(`Analytics:    ${analyticsCount}`);
    console.log('\n');

    // Check if database is empty
    if (userCount === 0 && subjectCount === 0 && questionCount === 0) {
      console.log('⚠️  DATABASE IS EMPTY!\n');
      console.log('💡 Next step: Run the seeder to populate the database');
      console.log('   Command: npm run seed\n');
      process.exit(0);
    }

    // Show users
    if (userCount > 0) {
      console.log('👥 USERS:\n');
      const users = await User.findAll({
        attributes: ['fullName', 'email', 'role', 'class', 'subscriptionPlan'],
        limit: 10
      });
      
      users.forEach(user => {
        console.log(`  • ${user.fullName}`);
        console.log(`    Email: ${user.email}`);
        console.log(`    Role: ${user.role}`);
        if (user.class) console.log(`    Class: ${user.class}`);
        console.log(`    Plan: ${user.subscriptionPlan}`);
        console.log('');
      });
    }

    // Show subjects
    if (subjectCount > 0) {
      console.log('📚 SUBJECTS:\n');
      const subjects = await Subject.findAll({
        attributes: ['name', 'code', 'isActive']
      });
      
      subjects.forEach(subject => {
        console.log(`  • ${subject.name} (${subject.code}) - ${subject.isActive ? 'Active' : 'Inactive'}`);
      });
      console.log('\n');
    }

    // Show questions by subject
    if (questionCount > 0) {
      console.log('❓ QUESTIONS BY SUBJECT:\n');
      const subjects = await Subject.findAll();
      
      for (const subject of subjects) {
        const count = await Question.count({ where: { subjectId: subject.id } });
        if (count > 0) {
          console.log(`  ${subject.name}: ${count} questions`);
          
          // Show topics for this subject
          const topics = await Question.findAll({
            where: { subjectId: subject.id },
            attributes: ['topic'],
            group: ['topic'],
            raw: true
          });
          
          topics.forEach(t => {
            const topicCount = Question.count({ 
              where: { subjectId: subject.id, topic: t.topic } 
            });
            console.log(`    - ${t.topic}`);
          });
        }
      }
      console.log('\n');
    }

    // Show sample question
    if (questionCount > 0) {
      console.log('📝 SAMPLE QUESTION:\n');
      const sampleQuestion = await Question.findOne({
        include: [{
          model: Subject,
          as: 'subject',
          attributes: ['name']
        }]
      });
      
      if (sampleQuestion) {
        console.log(`  Subject: ${sampleQuestion.subject.name}`);
        console.log(`  Topic: ${sampleQuestion.topic}`);
        console.log(`  Question: ${sampleQuestion.text}`);
        console.log(`  Difficulty: ${sampleQuestion.difficulty}`);
        console.log(`  Options: ${sampleQuestion.options.length}`);
        console.log('\n');
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ DATABASE VERIFICATION COMPLETE!\n');

    if (userCount > 0) {
      console.log('🔐 You can now login with these credentials:\n');
      
      const admin = await User.findOne({ where: { role: 'admin' } });
      if (admin) {
        console.log('Admin:');
        console.log(`  Email: ${admin.email}`);
        console.log('  Password: Admin@123\n');
      }
      
      const student = await User.findOne({ where: { role: 'student' } });
      if (student) {
        console.log('Student:');
        console.log(`  Email: ${student.email}`);
        console.log('  Password: Student@123\n');
      }
    }

    console.log('🚀 Start the server: npm run dev\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error verifying database:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

verifyDatabase();