const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('../models/User');
const plannerService = require('../services/plannerService');

/**
 * Daily Smart Planner Cron Job
 * 
 * Runs every day at 6:00 AM IST to auto-generate smart tasks
 * for all active users who have a selected exam.
 * 
 * Schedule: '0 6 * * *' → At 06:00 every day
 * 
 * Usage:
 *   const { startDailyPlannerCron } = require('./cron/dailyPlanner');
 *   startDailyPlannerCron(); // Call once during server boot
 */

let cronJob = null;

/**
 * Start the daily planner cron job
 * @param {string} timezone - IANA timezone string (default: 'Asia/Kolkata')
 */
function startDailyPlannerCron(timezone = 'Asia/Kolkata') {
  if (cronJob) {
    console.warn('⚠️  Daily planner cron is already running.');
    return;
  }

  // Run at 6:00 AM every day
  cronJob = cron.schedule('0 6 * * *', async () => {
    console.log('🕕 [CRON] Starting daily smart plan generation...');

    try {
      // Get all users who have selected an exam
      const users = await User.find(
        { selectedExam: { $ne: null } },
        { _id: 1, username: 1 }
      ).lean();

      console.log(`📋 [CRON] Found ${users.length} active users.`);

      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          const result = await plannerService.generateDailyTasks(user._id);

          if (result.isExisting) {
            skipCount++;
          } else {
            successCount++;
            console.log(`  ✅ Generated ${result.tasks.length} tasks for ${user.username}`);
          }
        } catch (err) {
          errorCount++;
          console.error(`  ❌ Failed for ${user.username}:`, err.message);
        }
      }

      console.log(`🕕 [CRON] Done! Generated: ${successCount}, Skipped: ${skipCount}, Errors: ${errorCount}`);
    } catch (err) {
      console.error('❌ [CRON] Fatal error in daily planner cron:', err);
    }
  }, {
    scheduled: true,
    timezone,
  });

  console.log(`⏰ Daily smart planner cron scheduled (6:00 AM ${timezone})`);
}

/**
 * Stop the cron job (for graceful shutdown)
 */
function stopDailyPlannerCron() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log('⏰ Daily planner cron stopped.');
  }
}

module.exports = {
  startDailyPlannerCron,
  stopDailyPlannerCron,
};
