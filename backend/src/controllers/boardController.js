const Board = require('../models/Board');
const Project = require('../models/Project');

const checkProjectAccess = async (projectId, userId, isAdmin) => {
  const project = await Project.findById(projectId);
  if (!project) return false;
  if (isAdmin) return true;
  return project.createdBy.toString() === userId.toString() || project.members.some((m) => m.toString() === userId.toString());
};

exports.getBoards = async (req, res, next) => {
  try {
    const canAccess = await checkProjectAccess(req.query.projectId, req.user._id, req.user.role === 'admin');
    if (!canAccess) return res.status(403).json({ success: false, message: 'Access denied' });
    
    // Tenant Isolation: Always filter by organization
    const boards = await Board.find({ 
      project: req.query.projectId,
      organization: req.user.organization 
    }).sort('order');
    res.status(200).json({ success: true, data: boards });
  } catch (err) {
    next(err);
  }
};

exports.createBoard = async (req, res, next) => {
  try {
    const canAccess = await checkProjectAccess(req.body.project, req.user._id, req.user.role === 'admin');
    if (!canAccess) return res.status(403).json({ success: false, message: 'Access denied' });
    const board = await Board.create(req.body);
    res.status(201).json({ success: true, data: board });
  } catch (err) {
    next(err);
  }
};

exports.updateBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ success: false, message: 'Board not found' });
    const canAccess = await checkProjectAccess(board.project, req.user._id, req.user.role === 'admin');
    if (!canAccess) return res.status(403).json({ success: false, message: 'Access denied' });
    Object.assign(board, req.body);
    await board.save();
    res.status(200).json({ success: true, data: board });
  } catch (err) {
    next(err);
  }
};

exports.deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ success: false, message: 'Board not found' });
    const canAccess = await checkProjectAccess(board.project, req.user._id, req.user.role === 'admin');
    if (!canAccess) return res.status(403).json({ success: false, message: 'Access denied' });
    await board.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
