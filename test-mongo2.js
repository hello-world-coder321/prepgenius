const mongoose = require('mongoose');

async function test() {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  
  const Progress = require('./models/Progress');
  
  const userId = new mongoose.Types.ObjectId();
  const topic = 'TestTopic';
  const subject = 'TestSubject';
  
  let progress = new Progress({ userId, topic, subject });
  progress.totalCorrect += 3;
  progress.totalAttempted += 5;
  progress.masteryPercent = 60;
  progress.quizHistory.push({ score: 3, total: 5, difficultyLevel: 1 });
  
  try {
    await progress.save();
    console.log("Progress save successful!");
  } catch (err) {
    console.error("Progress save failed:", err.message);
  }

  process.exit();
}
test();
