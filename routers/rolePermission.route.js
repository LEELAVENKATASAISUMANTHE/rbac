import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requirePermission } from '../utils/authMiddleware.js';
import { 
    getPermissionsByRoleId, 
    assignPermissionToRole, 
    removePermissionFromRole, 
    checkRoleAccess,
} from '../controllers/rolePermission.controller.js';
import { simpleAuth } from '../utils/jwt.js';

const router = express.Router();

// GET /api/role-permissions/:roleId - Get all permissions for a role (requires read_role_permissions)
router.get('/:roleId', simpleAuth, requirePermission('read_role_permissions'), asyncHandler(getPermissionsByRoleId));

// POST /api/role-permissions - Assign permission to role (requires assign_role_permissions)
router.post('/', simpleAuth, requirePermission('assign_role_permissions'), asyncHandler(assignPermissionToRole));

// DELETE /api/role-permissions - Remove permission from role (requires delete_role_permissions)
router.delete('/', simpleAuth, requirePermission('delete_role_permissions'), asyncHandler(removePermissionFromRole));

// POST /api/role-permissions/check-access - Check if role has specific permission (requires read_role_permissions)
router.post('/check-access', simpleAuth, asyncHandler(checkRoleAccess));

export default router;