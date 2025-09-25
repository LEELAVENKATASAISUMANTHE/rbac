import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { simpleAuth } from '../utils/jwt.js';
import { canReadUsers, canWriteUsers, canDeleteUsers } from '../utils/authMiddleware.js';
import { registerUser, loginUser, getUserData, deleteUser } from '../controllers/user.controller.js';

const router = express.Router();

// POST /api/users/register - register a new user (open)
router.post('/register', asyncHandler(registerUser));

// GET /api/users/me - get current logged-in user's data (requires read_users)
router.get('/me', simpleAuth, canReadUsers, asyncHandler(getUserData));

// DELETE /api/users/:id - delete user (requires delete_users)
router.delete('/:id', simpleAuth, canDeleteUsers, asyncHandler(deleteUser));

export default router;
