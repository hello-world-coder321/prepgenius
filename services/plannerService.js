const Task = require('../models/Task');
const Revision = require('../models/Revision');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Topic = require('../models/Topic');
const { getSyllabusModelsForExam } = require('../models/Syllabus');
/**
 * Smart Daily Planner Service (Global Syllabus Edition)
 * 
 * Generates exactly 8 tasks per day:
 *   - 6 tasks from Global Syllabus collections
 *   - 2 tasks from user's Revision collection
 */

const SYLLABUS_COUNT = 6;
const REVISION_COUNT = 2;
const TOTAL_TASKS = 8;

/**
 * Fisher-Yates shuffle
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

async function generateDailyTasks(userId) {
  const today = getToday();

  // 1. ALWAYS sync SRS Topics to Revision first (before idempotency)
  const allSrsTopics = await Topic.find({ userId });
  const srsSyncOps = [];
  const nowDate = new Date();

  for (const t of allSrsTopics) {
    const isOverdue = nowDate >= new Date(t.nextDue);
    const daysSince = (nowDate - t.lastStudied) / 86400000;
    const S = Math.max(0.5, t.interval * 0.7);
    const retention = Math.round(Math.max(2, Math.exp(-daysSince / S) * 100));

    if (isOverdue || retention < 50) {
      srsSyncOps.push({
        updateOne: {
          filter: { userId, topic: t.name },
          update: {
            $set: {
              subject: t.subject,
              lastSeen: t.lastStudied,
              interval: t.interval,
              easeFactor: t.easeFactor,
              repetitions: t.repetitions,
              nextReviewDate: t.nextDue
            }
          },
          upsert: true
        }
      });
    }
  }
  
  if (srsSyncOps.length > 0) {
    try {
      await Revision.bulkWrite(srsSyncOps);
      console.log(`[SRS Sync] Synced ${srsSyncOps.length} SRS topics to Revision DB for user ${userId}`);
    } catch (e) {
      console.error('Failed to sync SRS topics to Revision:', e);
    }
  }

  // 2. Idempotency Check — but regenerate if revisions are now available
  const existingTasks = await Task.find({ userId, scheduledDate: today }).lean();
  if (existingTasks.length > 0) {
    const hasRevisionTasks = existingTasks.some(t => t.type === 'revision');
    const dueRevisions = await Revision.countDocuments({ userId, nextReviewDate: { $lte: nowDate } });
    
    // If plan exists WITH revision tasks already, or no revisions are available, return as-is
    if (hasRevisionTasks || dueRevisions === 0) {
      return { tasks: existingTasks, isExisting: true };
    }
    
    // Otherwise, revisions just became available — delete the stale plan and regenerate
    console.log(`[Planner] Regenerating plan: found ${dueRevisions} due revisions but plan had 0 revision tasks`);
    await Task.deleteMany({ userId, scheduledDate: today });
  }

  // 3. Fetch User to determine target exam
  const user = await User.findById(userId).lean();
  if (!user || !user.selectedExam) {
    throw new Error('User has no selected exam. Cannot generate global syllabus plan.');
  }

  // 4. Find Global Syllabus Models for this exam (JEE or NEET)
  const syllabusModels = getSyllabusModelsForExam(user.selectedExam);
  if (syllabusModels.length === 0) {
    throw new Error(`Syllabus not configured for exam: ${user.selectedExam}`);
  }

  // 5. Daily Rotation: avoid repeating yesterday's tasks
  const yesterday = getYesterday();
  const yesterdayTasks = await Task.find(
    { userId, scheduledDate: yesterday },
    { sourceTopicId: 1 }
  ).lean();
  const yesterdayTopicIds = yesterdayTasks.map(t => t.sourceTopicId.toString());

  // 6. Fetch Global Syllabus Topics
  const globalTopicPromises = syllabusModels.map(model => 
    model.find({ _id: { $nin: yesterdayTopicIds } }).lean()
  );
  
  const globalTopicResults = await Promise.all(globalTopicPromises);
  let allSyllabusTopics = globalTopicResults.flat();

  // 7. Filter out Mastered topics using user's Progress collection
  const progressData = await Progress.find({ userId }).lean();
  const masteredTopicNames = new Set(
    progressData.filter(p => p.strength === 'mastered' || p.masteryPercent >= 80).map(p => p.topic)
  );
  const weakTopicNames = new Set(
    progressData.filter(p => p.strength === 'weak' || p.masteryPercent < 30).map(p => p.topic)
  );

  allSyllabusTopics = allSyllabusTopics.filter(t => !masteredTopicNames.has(t.subtopic) && !masteredTopicNames.has(t.topicName));

  // 8. Priority Assignment for Syllabus
  const syllabusWithPriority = allSyllabusTopics.map(topic => {
    let priority = 'medium';
    if (weakTopicNames.has(topic.subtopic) || weakTopicNames.has(topic.topicName)) {
      priority = 'high';
    } else if (topic.difficulty === 'hard') {
      priority = 'high';
    }
    return { ...topic, priority };
  });

  const highPriority = shuffleArray(syllabusWithPriority.filter(t => t.priority === 'high'));
  const medPriority  = shuffleArray(syllabusWithPriority.filter(t => t.priority === 'medium'));
  const lowPriority  = shuffleArray(syllabusWithPriority.filter(t => t.priority === 'low'));
  const shuffledSyllabus = [...highPriority, ...medPriority, ...lowPriority];

  // 9. Fetch User's Revision Topics
  const allRevisionTopics = await Revision.find({
    userId,
    nextReviewDate: { $lte: new Date() },
    _id: { $nin: yesterdayTopicIds },
  }).sort({ easeFactor: 1 }).lean();

  const revisionWithPriority = allRevisionTopics.map(rev => {
    let priority = 'medium';
    if (rev.easeFactor <= 1.8) priority = 'high';
    else if (rev.easeFactor >= 2.5) priority = 'low';
    return { ...rev, priority };
  });

  // 9. Select Tasks with Equal Subject Distribution
  let selectedSyllabus = [];
  let selectedRevision = [];

  // Determine revision tasks
  if (revisionWithPriority.length >= REVISION_COUNT) {
    selectedRevision = revisionWithPriority.slice(0, REVISION_COUNT);
  } else {
    selectedRevision = [...revisionWithPriority];
  }
  const neededSyllabus = TOTAL_TASKS - selectedRevision.length;

  // Group syllabus topics by subject to ensure equal distribution
  const syllabusBySubject = {};
  shuffledSyllabus.forEach(topic => {
    if (!syllabusBySubject[topic.subject]) {
      syllabusBySubject[topic.subject] = [];
    }
    syllabusBySubject[topic.subject].push(topic);
  });

  const subjects = Object.keys(syllabusBySubject);
  const targetPerSubject = subjects.length > 0 ? Math.floor(neededSyllabus / subjects.length) : 0;
  
  // Pick targetPerSubject for each subject
  subjects.forEach(sub => {
    const toPick = Math.min(targetPerSubject, syllabusBySubject[sub].length);
    selectedSyllabus.push(...syllabusBySubject[sub].splice(0, toPick));
  });

  // If there are still missing syllabus slots (due to Math.floor or insufficient topics in a subject)
  // Fill them cyclically from remaining available topics in any subject
  while (selectedSyllabus.length < neededSyllabus) {
    let added = false;
    for (const sub of subjects) {
      if (selectedSyllabus.length >= neededSyllabus) break;
      if (syllabusBySubject[sub].length > 0) {
        selectedSyllabus.push(syllabusBySubject[sub].shift());
        added = true;
      }
    }
    if (!added) break; // No more topics available in any subject
  }

  // If we ran out of syllabus topics entirely, try to fill with extra revisions
  if (selectedSyllabus.length + selectedRevision.length < TOTAL_TASKS) {
    const remainingMissing = TOTAL_TASKS - (selectedSyllabus.length + selectedRevision.length);
    const extraRevisions = revisionWithPriority.slice(selectedRevision.length, selectedRevision.length + remainingMissing);
    selectedRevision.push(...extraRevisions);
  }

  // 10. Build Task Objects for DB Insertion
  const now = new Date();
  const tasksToInsert = [];
  const usedIds = new Set();

  for (const topic of selectedSyllabus) {
    const id = topic._id.toString();
    if (usedIds.has(id)) continue;
    usedIds.add(id);

    tasksToInsert.push({
      userId,
      title: topic.subtopic || topic.topicName,
      subject: topic.subject,
      type: 'syllabus',
      status: 'pending',
      scheduledDate: today,
      sourceTopicId: topic._id,
      priority: topic.priority,
      chapter: topic.chapterName || '',
      createdAt: now,
    });
  }

  for (const rev of selectedRevision) {
    const id = rev._id.toString();
    if (usedIds.has(id)) continue;
    usedIds.add(id);

    tasksToInsert.push({
      userId,
      title: rev.topic,
      subject: rev.subject,
      type: 'revision',
      status: 'pending',
      scheduledDate: today,
      sourceTopicId: rev._id,
      priority: rev.priority,
      chapter: '',
      createdAt: now,
    });
  }

  if (tasksToInsert.length === 0) {
    return { tasks: [], isExisting: false };
  }

  try {
    await Task.insertMany(tasksToInsert, { ordered: false });
  } catch (err) {
    if (err.code !== 11000 && !err.writeErrors) { throw err; }
  }

  const tasks = await Task.find({ userId, scheduledDate: today })
    .sort({ type: 1, priority: -1 })
    .lean();

  return { tasks, isExisting: false };
}

async function toggleTaskStatus(taskId, userId) {
  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) throw new Error('Task not found');
  task.status = task.status === 'pending' ? 'completed' : 'pending';
  // Note: Here is where you would normally also trigger an update to Progress.js
  // or Revision.js scheduling algorithms.
  await task.save();
  return task;
}

async function getTodayTasks(userId) {
  const today = getToday();
  const tasks = await Task.find({ userId, scheduledDate: today })
    .sort({ type: 1, priority: -1 })
    .lean();

  const syllabusTasks = tasks.filter(t => t.type === 'syllabus');
  const revisionTasks = tasks.filter(t => t.type === 'revision');
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return {
    tasks,
    syllabusTasks,
    revisionTasks,
    stats: {
      total: tasks.length,
      completed: completedCount,
      pending: tasks.length - completedCount,
      progressPercent: tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0,
    },
  };
}

module.exports = {
  generateDailyTasks,
  toggleTaskStatus,
  getTodayTasks,
};
