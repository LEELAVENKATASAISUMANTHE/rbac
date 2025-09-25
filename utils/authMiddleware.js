import { checkAccess } from '../db/rolepermission.db.js';
import { asyncHandler } from './asyncHandler.js';

// Minimal, clear permission middlewares using role-based permission checks
export const requirePermission = (requiredPermission) =>
  asyncHandler(async (req, res, next) => {
    console.log('rq,user',req.user);
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!req.user.role_id) return res.status(403).json({ success: false, message: 'User role not found' });

    const hasAccess = await checkAccess(req.user.role_id, requiredPermission);
    if (!hasAccess) return res.status(403).json({ success: false, message: `Access denied. Required permission: ${requiredPermission}` });

    return next();
  });

export const requireAllPermissions = (requiredPermissions) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.role_id) return res.status(401).json({ success: false, message: 'Authentication required' });

    const checks = await Promise.all(requiredPermissions.map(p => checkAccess(req.user.role_id, p)));
    if (!checks.every(Boolean)) return res.status(403).json({ success: false, message: 'Access denied. Missing required permissions' });

    return next();
  });

export const requireAnyPermission = (requiredPermissions) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.role_id) return res.status(401).json({ success: false, message: 'Authentication required' });

    const checks = await Promise.all(requiredPermissions.map(p => checkAccess(req.user.role_id, p)));
    if (!checks.some(Boolean)) return res.status(403).json({ success: false, message: 'Access denied. Need at least one of the required permissions' });

    return next();
  });

