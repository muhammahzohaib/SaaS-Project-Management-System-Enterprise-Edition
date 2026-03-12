const Project = require('../models/Project');
const mongoose = require('mongoose');

// IDOR prevention: ensure user can only access projects they own or are member of
const checkAccess = (project, userId, isAdmin) => {
  if (isAdmin) return true;
  const id = userId.toString();
  return project.createdBy.toString() === id || project.members.some((m) => m.toString() === id);
};

exports.getProjects = async (req, res, next) => {
  try {
    // Tenant Isolation: Always filter by organization
    const filter = { organization: req.user.organization };
    
    // For non-admins, also filter by membership/ownership within that org
    if (req.user.role !== 'admin') {
      filter.$or = [{ createdBy: req.user._id }, { members: req.user._id }];
    }

    const projects = await Project.find(filter).populate('createdBy', 'name email').sort('-createdAt');
    res.status(200).json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
};

exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    
    // Tenant Isolation Check
    if (project.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied: Tenant mismatch' });
    }

    if (!checkAccess(project, req.user._id, req.user.role === 'admin')) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

const Board = require('../models/Board');

exports.createProject = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;
    req.body.organization = req.user.organization;
    const project = await Project.create(req.body);

    // UX: Automatically create default boards for a new project
    const defaultBoards = ['To Do', 'In Progress', 'Done'];
    const boardPromises = defaultBoards.map((title, index) => 
      Board.create({
        title,
        project: project._id,
        organization: req.user.organization,
        order: index
      })
    );
    await Promise.all(boardPromises);

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (!checkAccess(project, req.user._id, req.user.role === 'admin')) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (!checkAccess(project, req.user._id, req.user.role === 'admin')) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    await project.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
