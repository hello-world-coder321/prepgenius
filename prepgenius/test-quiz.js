const mongoose = require('mongoose');
const Progress = require('./models/Progress');
const Revision = require('./models/Revision');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/prepgenius');
  
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
    console.log("Success");
  } catch (err) {
    console.error("Error saving Progress:");
    console.error(err);
  }

  process.exit();
}
test();
