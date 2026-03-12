const Task = require('../models/Task');
const Board = require('../models/Board');
const Project = require('../models/Project');
const { emitToOrg } = require('../utils/socket');
const { logActivity } = require('../utils/activityLogger');
const { processAutomations } = require('../utils/automationEngine');

const checkBoardAccess = async (boardId, userId, isAdmin) => {
  const board = await Board.findById(boardId).populate('project');
  if (!board?.project) return false;
  const projectId = board.project._id || board.project;
  const project = await Project.findById(projectId);
  if (!project) return false;
  if (isAdmin) return true;
  return project.createdBy.toString() === userId.toString() || project.members.some((m) => m.toString() === userId.toString());
};

exports.getTasks = async (req, res, next) => {
  try {
    const canAccess = await checkBoardAccess(req.query.boardId, req.user._id, req.user.role === 'admin');
    if (!canAccess) return res.status(403).json({ success: false, message: 'Access denied' });
    
    // Tenant Isolation: Always filter by organization
    const tasks = await Task.find({ 
      board: req.query.boardId,
      organization: req.user.organization._id 
    }).populate('assignee', 'name email').sort('order');
    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const canAccess = await checkBoardAccess(req.body.board, req.user._id, req.user.role === 'admin');
    if (!canAccess) return res.status(403).json({ success: false, message: 'Access denied' });
    
    const board = await Board.findById(req.body.board);
    const task = await Task.create({
      ...req.body,
      organization: req.user.organization._id
    });

    // Smart Features: Log and Notify
    await logActivity({
      organization: req.user.organization._id,
      user: req.user._id,
      project: board.project,
      task: task._id,
      action: 'task_created',
      details: `created task: ${task.title}`,
      notifyRecipient: task.assignee
    });

    // Run Automation
    await processAutomations(task, 'task_created', req.user);

    emitToOrg(req.user.organization._id.toString(), 'task_created', task);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    const canAccess = await checkBoardAccess(task.board, req.user._id, req.user.role === 'admin');
    if (!canAccess) return res.status(403).json({ success: false, message: 'Access denied' });
    
    const oldAssignee = task.assignee;
    Object.assign(task, req.body);
    await task.save();

    // Smart Features: Log and Notify if status changed or assignee changed
    if (req.body.status || req.body.assignee) {
      await logActivity({
        organization: req.user.organization._id,
        user: req.user._id,
        task: task._id,
        action: 'task_updated',
        details: req.body.assignee ? `reassigned task to team member` : `updated status to ${task.status}`,
        notifyRecipient: req.body.assignee || task.assignee
      });
    }

    // Run Automation if status changed
    if (req.body.status) {
      await processAutomations(task, 'status_changed', req.user);
    }

    emitToOrg(req.user.organization._id.toString(), 'task_updated', task);
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    const canAccess = await checkBoardAccess(task.board, req.user._id, req.user.role === 'admin');
    if (!canAccess) return res.status(403).json({ success: false, message: 'Access denied' });
    await task.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    
    task.comments.push({
      user: req.user._id,
      text: req.body.text
    });
    await task.save();

    await logActivity({
      organization: req.user.organization._id,
      user: req.user._id,
      task: task._id,
      action: 'comment_added',
      details: `commented on task: "${req.body.text.substring(0, 30)}..."`,
      notifyRecipient: task.assignee
    });

    const updatedTask = await Task.findById(task._id).populate('comments.user', 'name');
    emitToOrg(req.user.organization._id.toString(), 'task_updated', updatedTask);
    res.json({ success: true, data: updatedTask });
  } catch (err) {
    next(err);
  }
};

exports.addSubtask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    
    task.subtasks.push({
      title: req.body.title,
      isCompleted: false
    });
    await task.save();

    await logActivity({
      organization: req.user.organization._id,
      user: req.user._id,
      task: task._id,
      action: 'task_updated',
      details: `added subtask: ${req.body.title}`
    });

    emitToOrg(req.user.organization._id.toString(), 'task_updated', task);
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};
