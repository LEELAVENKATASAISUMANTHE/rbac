import { getclient } from "./dbset.js";
import { handlePostgresError } from "../utils/postgresErrorHandler.js";

const assignpermissiontorole = async(role_id, permission_id)=>{
    const client = await getclient();
    try {
        const res = await client.query("INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) RETURNING *", [role_id, permission_id]);
        return res.rows[0];
    } catch (error) {
        handlePostgresError(error);
    } finally {
        client.release();
    }
};
const removepermissionfromrole = async(role_id, permission_id)=>{
    const client = await getclient();
    try {
        const res = await client.query("DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2 RETURNING *", [role_id, permission_id]);
        return res.rows[0];
    } catch (error) {
        handlePostgresError(error);
    } finally {
        client.release();
    }
};
const getpermissionsbyroleid = async(role_id)=>{
    const client = await getclient();
    try {
        const res = await client.query("SELECT * FROM role_permissions WHERE role_id = $1", [role_id]);
        return res.rows;
    } catch (error) {
        handlePostgresError(error);
    } finally {
        client.release();
    }
};
const checkAccess = async (user_role_id, requiredPermission) => {
    if (!user_role_id || !requiredPermission) {
        return false; // No role ID or permission name provided
    }
    
    const client = await getclient();
    try {
        // Query to check if the role has the required permission
        const query = `
            SELECT COUNT(*) as count 
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.role_id = $1 AND p.name = $2
        `;
        
        const result = await client.query(query, [user_role_id, requiredPermission]);
        const count = parseInt(result.rows[0].count);
        
        return count > 0; // Return true if permission exists, false otherwise
    } catch (error) {
        handlePostgresError(error);
        return false; // Return false on error
    } finally {
        client.release();
    }
};

// Alternative function to check access by user ID (if you have a users table)
const checkUserAccess = async (user_id, requiredPermission) => {
    if (!user_id || !requiredPermission) {
        return false; // No user ID or permission name provided
    }
    
    const client = await getclient();
    try {
        // Query to check if the user has the required permission through their role
        const query = `
            SELECT COUNT(*) as count 
            FROM users u
            JOIN roles r ON u.role_id = r.id
            JOIN role_permissions rp ON r.id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE u.id = $1 AND p.name = $2 AND r.is_active = true
        `;
        
        const result = await client.query(query, [user_id, requiredPermission]);
        const count = parseInt(result.rows[0].count);
        
        return count > 0; // Return true if permission exists, false otherwise
    } catch (error) {
        handlePostgresError(error);
        return false; // Return false on error
    } finally {
        client.release();
    }
};

export { assignpermissiontorole, removepermissionfromrole, getpermissionsbyroleid, checkAccess, checkUserAccess };