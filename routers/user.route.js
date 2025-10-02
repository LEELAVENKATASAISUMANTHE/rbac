import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requirePermission } from '../utils/authMiddleware.js';
import { registerUser, getUserData, deleteUser, updateUser,getAllUsers } from '../controllers/user.controller.js';

const router = express.Router();

// POST /api/users/register - register a new user (open)
router.post('/register', requirePermission('create_users'), asyncHandler(registerUser));

// GET /api/users/me - get current logged-in user's data (requires read_user)
router.get('/me', requirePermission('read_user'), asyncHandler(getUserData));

// DELETE /api/users/:id - delete user (requires delete_users)
router.delete('/:id', requirePermission('delete_users'), asyncHandler(deleteUser));

// PUT /api/users/:id - update user (requires update_users)
router.put('/:id', requirePermission('update_users'), asyncHandler(updateUser));

// GET /api/users - get all users (requires read_users)
router.get('/', requirePermission('read_users'), asyncHandler(getAllUsers));

export default router;
