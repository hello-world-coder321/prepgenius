const plannerService = require('../services/plannerService');

/**
 * Smart Planner Controller
 * 
 * Handles HTTP requests for the smart daily planner feature.
 * Follows MVC pattern — all business logic lives in plannerService.
 */

/**
 * POST /planner/smart-generate
 * Generate 8 smart tasks for today (6 syllabus + 2 revision)
 */
async function smartGenerate(req, res) {
  try {
    const userId = req.session.user.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated.' });
    }

    const result = await plannerService.generateDailyTasks(userId);

    // Separate tasks by type for grouped display
    const syllabusTasks = result.tasks.filter(t => t.type === 'syllabus');
    const revisionTasks = result.tasks.filter(t => t.type === 'revision');

    res.json({
      success: true,
      isExisting: result.isExisting,
      tasks: result.tasks,
      syllabusTasks,
      revisionTasks,
      stats: {
        total: result.tasks.length,
        syllabus: syllabusTasks.length,
        revision: revisionTasks.length,
        completed: result.tasks.filter(t => t.status === 'completed').length,
      },
      message: result.isExisting
        ? 'Smart plan already exists for today.'
        : `Generated ${result.tasks.length} smart tasks for today!`,
    });
  } catch (err) {
    console.error('Smart Generate Error:', err);
    res.status(500).json({
      error: 'Failed to generate smart plan.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}

/**
 * POST /planner/smart-toggle/:taskId
 * Toggle a smart task's completion status (pending ↔ completed)
 */
async function toggleSmartTask(req, res) {
  try {
    const userId = req.session.user.id;
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ error: 'Task ID is required.' });
    }

    const updatedTask = await plannerService.toggleTaskStatus(taskId, userId);

    // Get updated stats
    const todayData = await plannerService.getTodayTasks(userId);

    res.json({
      success: true,
      task: updatedTask,
      stats: todayData.stats,
    });
  } catch (err) {
    console.error('Smart Toggle Error:', err);

    if (err.message === 'Task not found') {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.status(500).json({ error: 'Failed to toggle task status.' });
  }
}

/**
 * GET /planner/smart-tasks
 * Fetch today's smart tasks with stats
 */
async function getSmartTasks(req, res) {
  try {
    const userId = req.session.user.id;
    const todayData = await plannerService.getTodayTasks(userId);

    res.json({
      success: true,
      ...todayData,
    });
  } catch (err) {
    console.error('Get Smart Tasks Error:', err);
    res.status(500).json({ error: 'Failed to fetch smart tasks.' });
  }
}

module.exports = {
  smartGenerate,
  toggleSmartTask,
  getSmartTasks,
};
