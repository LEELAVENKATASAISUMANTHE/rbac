import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { axiosauth, requirePermission } from "../utils/authMiddleware.js";
import { registerStudent, updateStudent, getAllStudents, deleteStudent,getstudentbyidcontroller } from "../controllers/student.controller.js";
import { simpleAuth } from "../utils/jwt.js";
import { upload } from "../utils/multer.js";

const router = express.Router();

router.post('/register/:id', upload.single('resume'), asyncHandler(registerStudent));
// Get all students
router.get('/', simpleAuth, asyncHandler(getAllStudents));

// Get student by ID
router.get('/:id', simpleAuth, asyncHandler(getstudentbyidcontroller));

// Update student (optional resume replacement)
router.put('/:id', simpleAuth, upload.single('resume'), asyncHandler(updateStudent));

// Delete student
router.delete('/:id', asyncHandler(deleteStudent));


export default router;