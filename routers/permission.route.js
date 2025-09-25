import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requirePermission} from '../utils/authMiddleware.js';
import { getAllPermissions, getPermissionById, createPermission ,deletePermission } from '../controllers/permission.controller.js';
import { simpleAuth } from '../utils/jwt.js';

const router = express.Router();

// GET /api/permissions - Get all permissions (requires read_permissions)
router.get('/', simpleAuth, requirePermission('read_permissions'), asyncHandler(getAllPermissions));

// GET /api/permissions/:id - Get permission by ID (requires read_permissions)
router.get('/:id', simpleAuth, requirePermission('read_permissions_id'), asyncHandler(getPermissionById));

// POST /api/permissions - Create new permission (requires create_permissions)
router.post('/', simpleAuth, requirePermission('create_permissions'), asyncHandler(createPermission));

router.delete('/:id', simpleAuth, requirePermission('delete_permissions'), asyncHandler(deletePermission));
export default router;