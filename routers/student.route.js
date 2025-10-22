import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { axiosauth, requirePermission } from "../utils/authMiddleware.js";
import { registerStudent, updateStudent, getAllStudents, deleteStudent } from "../controllers/student.controller.js";
import { simpleAuth } from "../utils/jwt.js";
import { upload } from "../utils/multer.js";

const router = express.Router();

router.post('/register/:id', upload.single('resume'), asyncHandler(registerStudent));

// Get all students
router.get('/', simpleAuth, asyncHandler(getAllStudents));

// Update student (optional resume replacement)
router.put('/:id', simpleAuth, upload.single('resume'), asyncHandler(updateStudent));

// Delete student
router.delete('/:id', simpleAuth, asyncHandler(deleteStudent));

export default router;