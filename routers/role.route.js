import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requirePermission, canManageRoles } from '../utils/authMiddleware.js';
import { getRoleById, createRole, updateRole, deleteRole } from '../controllers/role.controller.js';

const router = express.Router();

// GET /api/roles/:id - Get role by ID (requires read_roles permission)
router.get('/:id', requirePermission('read_roles'), asyncHandler(getRoleById));

// POST /api/roles - Create new role (requires manage_roles permission)
router.post('/', canManageRoles, asyncHandler(createRole));

// PUT /api/roles/:id - Update role (requires manage_roles permission)
router.put('/:id', canManageRoles, asyncHandler(updateRole));

// DELETE /api/roles/:id - Delete role (requires manage_roles permission)
router.delete('/:id', canManageRoles, asyncHandler(deleteRole));

export default router;