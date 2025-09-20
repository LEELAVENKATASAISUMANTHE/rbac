import { checkAccess, checkUserAccess } from '../db/rolepermission.db.js';
import { asyncHandler } from './asyncHandler.js';

/**
 * Middleware to check if user has required permission based on role
 * Expects user object with role_id in req.user
 */
export const requirePermission = (requiredPermission) => {
    return asyncHandler(async (req, res, next) => {
        try {
            // Check if user is authenticated (you should have this from your auth middleware)
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Check if user has role_id
            if (!req.user.role_id) {
                return res.status(403).json({
                    success: false,
                    message: 'User role not found'
                });
            }

            // Check if user's role has the required permission
            const hasAccess = await checkAccess(req.user.role_id, requiredPermission);

            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required permission: ${requiredPermission}`,
                    requiredPermission: requiredPermission
                });
            }

            // User has permission, proceed to next middleware
            next();
        } catch (error) {
            console.error('Permission check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking permissions'
            });
        }
    });
};

/**
 * Middleware to check if user has required permission based on user ID
 * Expects user object with id in req.user (for users table lookup)
 */
export const requireUserPermission = (requiredPermission) => {
    return asyncHandler(async (req, res, next) => {
        try {
            // Check if user is authenticated
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Check if user has id
            if (!req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'User ID not found'
                });
            }

            // Check if user has the required permission through their role
            const hasAccess = await checkUserAccess(req.user.id, requiredPermission);

            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required permission: ${requiredPermission}`,
                    requiredPermission: requiredPermission
                });
            }

            // User has permission, proceed to next middleware
            next();
        } catch (error) {
            console.error('Permission check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking permissions'
            });
        }
    });
};

/**
 * Middleware to check multiple permissions (user must have ALL of them)
 */
export const requireAllPermissions = (requiredPermissions) => {
    return asyncHandler(async (req, res, next) => {
        try {
            if (!req.user || !req.user.role_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Check all permissions
            const permissionChecks = await Promise.all(
                requiredPermissions.map(permission => 
                    checkAccess(req.user.role_id, permission)
                )
            );

            // Check if user has all required permissions
            const hasAllPermissions = permissionChecks.every(hasPermission => hasPermission === true);

            if (!hasAllPermissions) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Missing required permissions',
                    requiredPermissions: requiredPermissions
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking permissions'
            });
        }
    });
};

/**
 * Middleware to check if user has ANY of the specified permissions
 */
export const requireAnyPermission = (requiredPermissions) => {
    return asyncHandler(async (req, res, next) => {
        try {
            if (!req.user || !req.user.role_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Check all permissions
            const permissionChecks = await Promise.all(
                requiredPermissions.map(permission => 
                    checkAccess(req.user.role_id, permission)
                )
            );

            // Check if user has at least one required permission
            const hasAnyPermission = permissionChecks.some(hasPermission => hasPermission === true);

            if (!hasAnyPermission) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Need at least one of the required permissions',
                    requiredPermissions: requiredPermissions
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking permissions'
            });
        }
    });
};

/**
 * Middleware for admin-only routes
 */
export const requireAdmin = requirePermission('admin_access');

/**
 * Common permission middlewares
 */
export const canReadUsers = requirePermission('read_users');
export const canWriteUsers = requirePermission('write_users');
export const canDeleteUsers = requirePermission('delete_users');
export const canManageRoles = requirePermission('manage_roles');
export const canManagePermissions = requirePermission('manage_permissions');