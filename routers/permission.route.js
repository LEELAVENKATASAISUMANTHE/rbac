import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requirePermission, canManagePermissions } from '../utils/authMiddleware.js';
import { getAllPermissions, getPermissionById, createPermission } from '../controllers/permission.controller.js';

const router = express.Router();

// GET /api/permissions - Get all permissions (requires read_permissions)
router.get('/', requirePermission('read_permissions'), asyncHandler(getAllPermissions));

// GET /api/permissions/:id - Get permission by ID (requires read_permissions)
router.get('/:id', requirePermission('read_permissions'), asyncHandler(getPermissionById));

// POST /api/permissions - Create new permission (requires manage_permissions)
router.post('/', canManagePermissions, asyncHandler(createPermission));

export default router;