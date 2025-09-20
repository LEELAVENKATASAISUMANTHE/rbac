import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requirePermission } from '../utils/authMiddleware.js';
import { 
    getPermissionsByRoleId, 
    assignPermissionToRole, 
    removePermissionFromRole, 
    checkRoleAccess, 
    checkUserPermissionAccess 
} from '../controllers/rolePermission.controller.js';
import { simpleAuth } from '../utils/jwt.js';

const router = express.Router();

// GET /api/role-permissions/:roleId - Get all permissions for a role (requires read_role_permissions)
router.get('/:roleId', simpleAuth, requirePermission('read_role_permissions'), asyncHandler(getPermissionsByRoleId));

// POST /api/role-permissions - Assign permission to role (requires manage_role_permissions)
router.post('/', simpleAuth, requirePermission('manage_role_permissions'), asyncHandler(assignPermissionToRole));

// DELETE /api/role-permissions - Remove permission from role (requires manage_role_permissions)
router.delete('/', simpleAuth, requirePermission('manage_role_permissions'), asyncHandler(removePermissionFromRole));

// POST /api/role-permissions/check-access - Check if role has specific permission (requires read_role_permissions)
router.post('/check-access', simpleAuth, requirePermission('read_role_permissions'), asyncHandler(checkRoleAccess));

// POST /api/role-permissions/check-user-access - Check if user has specific permission (requires read_role_permissions)
router.post('/check-user-access', simpleAuth, requirePermission('read_role_permissions'), asyncHandler(checkUserPermissionAccess));

export default router;