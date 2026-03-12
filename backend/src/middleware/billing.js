const Project = require('../models/Project');

/**
 * Subscription limit middleware
 * Ensures Freemium users don't exceed their plan limits
 */
const checkLimits = async (req, res, next) => {
  const org = req.user.organization;
  
  if (!org) {
    return res.status(403).json({ success: false, message: 'Organization required' });
  }

  // If enterprise, no limits check for now
  if (org.plan === 'enterprise') return next();

  // Project Limit Check
  if (req.originalUrl.includes('/projects') && req.method === 'POST') {
    const projectCount = await Project.countDocuments({ organization: org._id });
    if (projectCount >= org.limits.maxProjects) {
      return res.status(403).json({
        success: false,
        message: `Your current ${org.plan} plan is limited to ${org.limits.maxProjects} projects. Please upgrade to create more.`
      });
    }
  }

  next();
};

module.exports = { checkLimits };
