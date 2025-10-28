import { getuserbyid } from "../db/user.db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { formatError } from "../utils/errformatter.js";
import { createstudent, getstudentbyid, deletesudentbyid, updatestudentbyid, getallstudents } from "../db/student.db.js";
import joi from "joi";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const ALLOWED_RESUME_MIMES = ['application/pdf'];

// --- Validation schemas
const createStudentSchema = joi.object({
    offical_email: joi.string()
        .pattern(/^[A-Za-z0-9._%+-]+@bmsit\.in$/)
        .required()
        .messages({ 'string.pattern.base': 'offical_email must be a valid @bmsit.in email' }),
    personal_email: joi.string().email().required(),
    tenth_percentage: joi.number().min(0).max(100).required(),
    twelfth_percentage: joi.number().min(0).max(100).required(),
    backlogs: joi.number().integer().min(0).required(),
    // resume may be provided as a URL OR as a multipart file
    resume: joi.string().uri().optional(),
    LeetCode: joi.string().uri().required(),
    HackerRank: joi.string().uri().required(),
    HackerEarth: joi.string().uri().required(),
    linkedin: joi.string().uri().required(),
    CGPA: joi.number().min(0).max(10).required(),
    phone_number: joi.string().pattern(/^[0-9]{10}$/).required()
});

const updateStudentSchema = joi.object({
    offical_email: joi.string().pattern(/^[A-Za-z0-9._%+-]+@bmsit\.in$/).optional(),
    personal_email: joi.string().email().optional(),
    tenth_percentage: joi.number().min(0).max(100).optional(),
    twelfth_percentage: joi.number().min(0).max(100).optional(),
    backlogs: joi.number().integer().min(0).optional(),
    resume: joi.string().uri().optional(),
    LeetCode: joi.string().uri().optional(),
    HackerRank: joi.string().uri().optional(),
    HackerEarth: joi.string().uri().optional(),
    linkedin: joi.string().uri().optional(),
    CGPA: joi.number().min(0).max(10).optional(),
    phone_number: joi.string().pattern(/^[0-9]{10}$/).optional()
});

// --- Helpers
function sendSuccess(res, status, payload) {
    return res.status(status).json({ success: true, ...payload });
}

function sendError(res, status, message, errors = undefined) {
    const body = { success: false, message };
    if (errors) body.errors = errors;
    return res.status(status).json(body);
}

function normalizeStudentForm(body) {
    if (!body || typeof body !== 'object') return {};
    return {
        offical_email: body.offical_email || body.official_email || body.officialEmail || body['official email'] || null,
        personal_email: body.personal_email || body.personalEmail || body['personal email'] || null,
        LeetCode: body.LeetCode || body.leetCode || body.leetcode || null,
        HackerRank: body.HackerRank || body.hackerrank || null,
        HackerEarth: body.HackerEarth || body.hackerearth || null,
        linkedin: body.linkedin || body.LinkedIn || body.linkedIn || null,
        CGPA: body.CGPA !== undefined ? body.CGPA : (body.cgpa !== undefined ? body.cgpa : null),
        phone_number: body.phone_number || body.phoneNumber || body['phone number'] || null,
        tenth_percentage: body.tenth_percentage !== undefined ? Number(body.tenth_percentage) : (body.tenthPercentage !== undefined ? Number(body.tenthPercentage) : null),
        twelfth_percentage: body.twelfth_percentage !== undefined ? Number(body.twelfth_percentage) : (body.twelfthPercentage !== undefined ? Number(body.twelfthPercentage) : null),
        backlogs: body.backlogs !== undefined ? Number(body.backlogs) : (body.backlog !== undefined ? Number(body.backlog) : null),
        resume: body.resume || body.resume_url || null,
        user_id: body.user_id || body.userId || body.id || null
    };
}

function extractCloudinaryPublicId(url) {
    try {
        if (!url) return null;
        const u = new URL(url);
        const uploadIndex = u.pathname.indexOf('/upload/');
        if (uploadIndex === -1) return null;
        let afterUpload = u.pathname.slice(uploadIndex + '/upload/'.length);
        afterUpload = afterUpload.replace(/^v\d+\//, '');
        const lastDot = afterUpload.lastIndexOf('.');
        if (lastDot !== -1) afterUpload = afterUpload.slice(0, lastDot);
        if (afterUpload.startsWith('/')) afterUpload = afterUpload.slice(1);
        return afterUpload;
    } catch (err) {
        console.error('Error extracting public id from url', err, url);
        return null;
    }
}

// --- Controllers
export const registerStudent = asyncHandler(async (req, res) => {
    console.log('Raw request body:', req.body);
    const normalized = normalizeStudentForm(req.body);
    console.log('Normalized form data:', normalized);
    const studentid = req.params.id || normalized.user_id || req.user?.id;
    if (!studentid) return sendError(res, 400, 'student id required');

    const user = await getuserbyid(studentid);
    if (!user) return sendError(res, 404, 'user does not exist');
    if (user.role_id !== 13) return sendError(res, 403, 'user is not allowed to register as student');

    const { error: validationError, value: validated } = createStudentSchema.validate(normalized, { abortEarly: false, stripUnknown: true });
    if (validationError) return sendError(res, 422, 'validation failed', validationError.details.map(d => d.message));

    let resumeUrl = validated.resume || null;
    if (req.file && req.file.path) {
        if (req.file.mimetype && !ALLOWED_RESUME_MIMES.includes(req.file.mimetype)) {
            try { if (req.file && req.file.path) await fs.unlink(path.resolve(req.file.path)); } catch (_) {}
            return sendError(res, 415, 'Only PDF resumes are allowed');
        }
        try {
            const upload = await cloudinary.uploader.upload(req.file.path, { folder: 'student_resumes', use_filename: true, unique_filename: true, resource_type: 'raw' });
            resumeUrl = upload.secure_url;
        } catch (err) {
            console.error('Cloudinary upload failed', err);
            try { if (req.file && req.file.path) await fs.unlink(path.resolve(req.file.path)); } catch (_) {}
            throw formatError('Failed to upload resume');
        } finally {
            try { if (req.file && req.file.path) await fs.unlink(path.resolve(req.file.path)); } catch (_) {}
        }
    }
    if (!resumeUrl) return sendError(res, 400, 'resume is required (upload file or provide resume URL)');

    const payload = {
        id: studentid,
        offical_email: validated.offical_email || validated.official_email,
        personal_email: validated.personal_email,
        resume: resumeUrl,
        LeetCode: validated.LeetCode,
        HackerRank: validated.HackerRank,
        HackerEarth: validated.HackerEarth,
        linkedin: validated.linkedin,
        tenth_percentage: validated.tenth_percentage,
        twelfth_percentage: validated.twelfth_percentage,
        backlogs: validated.backlogs,
        CGPA: validated.CGPA,
        created_at: new Date(),
        phone_number: validated.phone_number
    };

    try {
        const created = await createstudent(payload);
        return sendSuccess(res, 201, { message: 'Student registered successfully', student: created });
    } catch (err) {
        console.error('DB create student error', err);
        throw formatError('Failed to create student');
    }
});

export const updateStudent = asyncHandler(async (req, res) => {
    const normalized = normalizeStudentForm(req.body);
    const studentid = req.params.id || normalized.user_id || req.user?.id;
    if (!studentid) return sendError(res, 400, 'student id required');

    const existing = await getstudentbyid(studentid);
    if (!existing) return sendError(res, 404, 'student not found');

    const { error: validationError, value: validated } = updateStudentSchema.validate(normalized, { abortEarly: false, stripUnknown: true });
    if (validationError) return sendError(res, 422, 'validation failed', validationError.details.map(d => d.message));

    // handle resume replacement if file uploaded
    let resumeUrl = existing.resume;
    if (req.file && req.file.path) {
        if (req.file.mimetype && !ALLOWED_RESUME_MIMES.includes(req.file.mimetype)) {
            try { if (req.file && req.file.path) await fs.unlink(path.resolve(req.file.path)); } catch (_) {}
            return sendError(res, 415, 'Only PDF resumes are allowed');
        }
        try {
            const upload = await cloudinary.uploader.upload(req.file.path, { folder: 'student_resumes', use_filename: true, unique_filename: true, resource_type: 'raw' });
            resumeUrl = upload.secure_url;
        } catch (err) {
            console.error('Cloudinary upload failed', err);
            try { if (req.file && req.file.path) await fs.unlink(path.resolve(req.file.path)); } catch (_) {}
            return sendError(res, 500, 'Failed to upload new resume');
        } finally {
            try { if (req.file && req.file.path) await fs.unlink(path.resolve(req.file.path)); } catch (_) {}
        }

        // attempt to delete old resume from Cloudinary
        if (existing.resume) {
            const publicId = extractCloudinaryPublicId(existing.resume);
            if (publicId) {
                try { await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' }); } catch (err) { console.error('Failed to delete old resume', err); }
            }
        }
    }

    const updateData = {
        offical_email: validated.offical_email || validated.official_email || existing.offical_email,
        personal_email: validated.personal_email || existing.personal_email,
        resume: resumeUrl,
        LeetCode: validated.LeetCode || existing.LeetCode,
        HackerRank: validated.HackerRank || existing.HackerRank,
        HackerEarth: validated.HackerEarth || existing.HackerEarth,
        linkedin: validated.linkedin || existing.linkedin,
        tenth_percentage: validated.tenth_percentage !== undefined ? validated.tenth_percentage : existing.tenth_percentage,
        twelfth_percentage: validated.twelfth_percentage !== undefined ? validated.twelfth_percentage : existing.twelfth_percentage,
        backlogs: validated.backlogs !== undefined ? validated.backlogs : existing.backlogs,
        CGPA: validated.CGPA !== undefined ? validated.CGPA : existing.CGPA,
        created_at: existing.created_at,
        phone_number: validated.phone_number || existing.phone_number
    };

    try {
        const result = await updatestudentbyid(studentid, updateData);
        return sendSuccess(res, 200, { message: 'Student updated', student: result.student });
    } catch (err) {
        console.error('DB update error', err);
        return sendError(res, 500, 'Failed to update student');
    }
});

export const getAllStudents = asyncHandler(async (req, res) => {
    try {
        const students = await getallstudents();
        return sendSuccess(res, 200, { students });
    } catch (err) {
        console.error('DB error fetching students:', err);
        return sendError(res, 500, 'Failed to fetch students');
    }
});

export const deleteStudent = asyncHandler(async (req, res) => {
    const studentid = req.params.id || req.user?.id;
    if (!studentid) return sendError(res, 400, 'student id required');

    const existing = await getstudentbyid(studentid);
    if (!existing) return sendError(res, 404, 'student not found');

    if (existing.resume) {
        const publicId = extractCloudinaryPublicId(existing.resume);
        if (publicId) {
            try { await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' }); } catch (err) { console.error('Failed to delete resume from Cloudinary', err); }
        }
    }

    try {
        const deleted = await deletesudentbyid(studentid);
        if (deleted) return sendSuccess(res, 200, { message: 'Student deleted' });
        return sendError(res, 500, 'Failed to delete student');
    } catch (err) {
        console.error('DB error deleting student:', err);
        return sendError(res, 500, 'Failed to delete student');
    }
});

export const getstudentbyidcontroller = asyncHandler(async (req, res) => {
    const studentid = req.params.id || req.user?.id;
    if (!studentid) return sendError(res, 400, 'student id required');

    try {
        const student = await getstudentbyid(studentid);
        if (!student) return sendError(res, 404, 'student not found');
        return sendSuccess(res, 200, { student });
    } catch (err) {
        console.error('DB error fetching student:', err);
        return sendError(res, 500, 'Failed to fetch student');
    }
});

export default { registerStudent, updateStudent, getAllStudents, deleteStudent, getstudentbyidcontroller };
