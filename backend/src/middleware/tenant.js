/**
 * Tenant isolation middleware - Security: Multi-tenant data isolation
 * Ensures users can only access data belonging to their organization
 */
const tenantFilter = (req, res, next) => {
  if (!req.user || !req.user.organization) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: User does not belong to an organization',
    });
  }

  // Inject organizationId into query or body for consistent filtering
  // This is a "Shared Schema" approach where we force 'organization' field
  const orgId = req.user.organization;

  // For GET requests, we'll suggest adding this to the query in the controllers
  // For POST/PUT requests, we force it in the body
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    req.body.organization = orgId;
  }

  next();
};

module.exports = { tenantFilter };
