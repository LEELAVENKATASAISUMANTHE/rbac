import { getclient } from "./dbset.js";
import { handlePostgresError } from "../utils/postgresErrorHandler.js";

export async function createUsers(data) {
    const client = await getclient();
    const text = 'INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING id';
    const values = [data.name, data.email, data.password, data.role_id];
    try {
        const res = await client.query(text, values);
        if (res.rowCount > 0) {
            return { success: true, message: 'User created successfully', id: res.rows[0].id };
        }
        return { success: false };
    } catch (error) {
        console.error('Error creating user:', error);
        handlePostgresError(error);
    } finally {
        client.release();
    }
}

export async function getUsers() {
    const client = await getclient();
    try {
        // Explicitly list columns to exclude password
        const res = await client.query('SELECT id, name, email, role_id FROM users ORDER BY id');

        return res.rows;
    } catch (error) {
        console.error('Error fetching users:', error);
        handlePostgresError(error);
    } finally {
        client.release();
    }
}

export async function deleteUserById(id) {
    const client = await getclient();
    try {
        const res = await client.query('DELETE FROM users WHERE id = $1', [id]);
        if (res.rowCount > 0) {
            return { success: true, message: 'User deleted successfully' };
        }
        return { success: false, message: 'User not found' };
    } catch (error) {
        console.error('Error deleting user:', error);
        handlePostgresError(error);
    } finally {
        client.release();
    }
}

export async function userbyemail(email) {
    const client = await getclient();
    try {
        const res = await client.query('SELECT id, name, email, role_id FROM users WHERE email = $1', [email]);
        if (res.rows.length > 0) return res.rows[0];
        return null;
    } catch (error) {
        console.error('Error fetching user by email:', error);
        handlePostgresError(error);
    } finally {
        client.release();
    }
}

export async function updateUserById(id, fields) {
    const client = await getclient();
    try {
        // fetch existing user
        const existingRes = await client.query('SELECT * FROM users WHERE id = $1', [id]);
        if (existingRes.rows.length === 0) {
            return { success: false, message: 'User not found' };
        }
        const existing = existingRes.rows[0];

        const newName = fields.name || existing.name;
        const newEmail = fields.email || existing.email;
        const newRoleId = fields.role_id !== undefined ? fields.role_id : existing.role_id;

        const res = await client.query(
            'UPDATE users SET name = $1, email = $2, role_id = $3 WHERE id = $4 RETURNING id',
            [newName, newEmail, newRoleId, id]
        );

        if (res.rowCount > 0) {
            return { success: true, message: 'User updated successfully', id: res.rows[0].id };
        }
        return { success: false, message: 'Update failed' };
    } catch (error) {
        console.error('Error updating user:', error);
        handlePostgresError(error);
    } finally {
        client.release();
    }
}
export const getuserbyid=async(id)=>{
    const client =await getclient();
    try {
        const res = await client.query("SELECT * FROM users WHERE id = $1", [id]);
        return res.rows[0];
    } catch (error) {
        handlePostgresError(error);
    }finally{
        client.release();
    }       };