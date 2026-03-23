const mongoose = require('mongoose');
const User = require('./models/User');
const Topic = require('./models/Topic');
const Revision = require('./models/Revision');
const Task = require('./models/Task');
const plannerService = require('./services/plannerService');

async function runTest() {
  await mongoose.connect('mongodb://127.0.0.1:27017/prepgenius');
  console.log('Connected to DB');

  // Create a test user
  const user = await User.create({
    username: 'testuser_' + Date.now(),
    email: 'test_' + Date.now() + '@example.com',
    password: 'password123',
    selectedExam: 'JEE'
  });

  const userId = user._id;

  // The global syllabus collections are already populated by our seed scripts, so we don't need to mock them anymore.
  // Create 4 revision topics
  const revisions = [];
  for (let i = 1; i <= 4; i++) {
    revisions.push({
      userId,
      topic: `Revision Topic ${i}`,
      subject: 'Math',
      easeFactor: 1.0 + (i * 0.5), // Lower is harder/higher priority
      nextReviewDate: new Date(Date.now() - 86400000) // Yesterday (due)
    });
  }
  await Revision.insertMany(revisions);

  console.log('--- Generating Tasks ---');
  const result = await plannerService.generateDailyTasks(userId);
  
  let syllabusCount = 0;
  let revisionCount = 0;

  result.tasks.forEach(t => {
    if (t.type === 'syllabus') syllabusCount++;
    if (t.type === 'revision') revisionCount++;
    console.log(`[${t.type}] ${t.title} (Priority: ${t.priority})`);
  });

  console.log(`\nResults: ${syllabusCount} Syllabus, ${revisionCount} Revision (Total: ${result.tasks.length})`);
  
  if (syllabusCount === 6 && revisionCount === 2) {
    console.log('✅ 6/2 Distribution test passed!');
  } else {
    console.error('❌ Distribution test failed!');
  }

  // Idempotency test
  console.log('\n--- Idempotency Test ---');
  const result2 = await plannerService.generateDailyTasks(userId);
  if (result2.isExisting && result2.tasks.length === 8) {
     console.log('✅ Idempotency test passed!');
  } else {
     console.error('❌ Idempotency test failed!');
  }

  // Toggle test
  console.log('\n--- Status Toggle Test ---');
  const taskId = result.tasks[0]._id;
  await plannerService.toggleTaskStatus(taskId, userId);
  const updatedTask = await Task.findById(taskId);
  if (updatedTask.status === 'completed') {
    console.log('✅ Status toggle passed!');
  } else {
    console.error('❌ Status toggle failed!');
  }

  await mongoose.disconnect();
  console.log('Done.');
}

runTest().catch(console.error);
