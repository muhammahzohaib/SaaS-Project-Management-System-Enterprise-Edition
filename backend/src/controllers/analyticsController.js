const Task = require('../models/Task');
const Project = require('../models/Project');
const mongoose = require('mongoose');

/**
 * Get organization-wide analytics
 */
exports.getOrgStats = async (req, res, next) => {
  try {
    const orgId = new mongoose.Types.ObjectId(req.user.organization);

    // 1. Task status distribution
    const taskStats = await Task.aggregate([
      { $match: { organization: orgId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // 2. Project counts
    const projectCount = await Project.countDocuments({ organization: orgId });

    // 3. Productivity (Tasks completed in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const completedRecently = await Task.countDocuments({
      organization: orgId,
      status: 'done',
      updatedAt: { $gte: sevenDaysAgo },
    });

    // 4. Workload distribution (Tasks per assignee)
    const workload = await Task.aggregate([
      { $match: { organization: orgId, status: { $ne: 'done' } } },
      { $group: { _id: '$assignee', taskCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: '$user.name',
          taskCount: 1,
        },
      },
    ]);

    // 5. Upcoming Deadlines (Due in next 7 days, not done)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const upcomingDeadlines = await Task.countDocuments({
      organization: orgId,
      status: { $ne: 'done' },
      dueDate: { $gte: new Date(), $lte: sevenDaysFromNow }
    });

    // 6. Productivity trend (compare this week vs last week completion)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const completedPreviousWeek = await Task.countDocuments({
      organization: orgId,
      status: 'done',
      updatedAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
    });

    let productivityTrend = 0;
    if (completedPreviousWeek === 0 && completedRecently > 0) {
      productivityTrend = 100; // infinite increase
    } else if (completedPreviousWeek > 0) {
      productivityTrend = Math.round(((completedRecently - completedPreviousWeek) / completedPreviousWeek) * 100);
    }

    res.status(200).json({
      success: true,
      data: {
        taskStats,
        projectCount,
        completedRecently,
        workload,
        upcomingDeadlines,
        productivityTrend
      },
    });
  } catch (err) {
    next(err);
  }
};
