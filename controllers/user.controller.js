import {createUsers,userbyemail,deleteUserById, updateUserById,getUsers} from "../db/user.db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { hashPassword } from "../utils/hash.js";

export const registerUser = asyncHandler(async (req, res) => {
    console.log("Register User Called");
    const { name, email, password, role_id } = req.body;
    const hashedPassword = await hashPassword(password);
    const result = await createUsers({ name, email, password: hashedPassword, role_id });
    if (result.success) {
        return res.status(201).json({ route: req.originalUrl, success: true, message: "User registered successfully" });
    }
    return res.status(500).json({ route: req.originalUrl, success: false, message: "User registration failed" });
});


export const deleteUser = asyncHandler(async (req, res) => {
    console.log("Delete User Called");
    const userId = req.params.id;
    try {
        const result = await deleteUserById(userId);
        if (result.success) {
            return res.status(200).json({ route: req.originalUrl, success: true, message: "User deleted successfully" });
        }
        return res.status(404).json({ route: req.originalUrl, success: false, message: "User not found" });
    } catch (error) {
        return res.status(500).json({ route: req.originalUrl, success: false, message: "Internal server error" });
    }
});

export const updateUser = asyncHandler(async (req, res) => {
    console.log("Update User Called");
    const userId = req.params.id;
    const { name, email, role_id } = req.body;
    try {
        const result = await updateUserById(userId, { name, email, role_id });
        if (result.success) {
            return res.status(200).json({ route: req.originalUrl, success: true, message: "User updated successfully" });
        }
        return res.status(404).json({ route: req.originalUrl, success: false, message: "User not found" });
    } catch (error) {
        return res.status(500).json({ route: req.originalUrl, success: false, message: "Internal server error" });
    }
});

export const getUserData = asyncHandler(async (req, res) => {
    console.log("Get User Data Called");
    const userEmail = req.user.email;
    const user = await userbyemail(userEmail);
    if (!user) {
        return res.status(401).json({ route: req.originalUrl, success: false, message: "User not authenticated" });
    }
    return res.status(200).json({ route: req.originalUrl, success: true, data: user });
});

export const getAllUsers = asyncHandler(async (req, res) => {
    console.log("Get All Users Called");
    const users = await getUsers();
    if (!users) {
        return res.status(404).json({ route: req.originalUrl, success: false, message: "No users found" });
    }
    return res.status(200).json({ route: req.originalUrl, success: true, data: users });
});