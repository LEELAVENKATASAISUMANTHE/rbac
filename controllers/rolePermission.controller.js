import { assignpermissiontorole, removepermissionfromrole, getpermissionsbyroleid, checkAccess, checkUserAccess } from '../db/rolepermission.db.js';

/**
 * Get all permissions for a specific role
 */
export const getPermissionsByRoleId = async (req, res) => {
    const { roleId } = req.params;
    
    if (!roleId || isNaN(roleId)) {
        return res.status(400).json({
            success: false,
            message: 'Valid role ID is required'
        });
    }

    const permissions = await getpermissionsbyroleid(parseInt(roleId));
    
    res.json({
        success: true,
        count: permissions.length,
        data: permissions,
        role_id: parseInt(roleId)
    });
};

/**
 * Assign permission to role
 */
export const assignPermissionToRole = async (req, res) => {
    const { role_id, permission_id } = req.body;
    
    if (!role_id || !permission_id || isNaN(role_id) || isNaN(permission_id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid role_id and permission_id are required'
        });
    }

    const assignment = await assignpermissiontorole(parseInt(role_id), parseInt(permission_id));
    
    res.status(201).json({
        success: true,
        message: 'Permission assigned to role successfully',
        data: assignment
    });
};

/**
 * Remove permission from role
 */
export const removePermissionFromRole = async (req, res) => {
    const { role_id, permission_id } = req.body;
    
    if (!role_id || !permission_id || isNaN(role_id) || isNaN(permission_id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid role_id and permission_id are required'
        });
    }

    const removedAssignment = await removepermissionfromrole(parseInt(role_id), parseInt(permission_id));
    
    if (!removedAssignment) {
        return res.status(404).json({
            success: false,
            message: 'Role-permission assignment not found'
        });
    }

    res.json({
        success: true,
        message: 'Permission removed from role successfully',
        data: removedAssignment
    });
};

/**
 * Check if role has specific permission
 */
export const checkRoleAccess = async (req, res) => {
    const { role_id, permission_name } = req.body;
    
    if (!role_id || !permission_name || isNaN(role_id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid role_id and permission_name are required'
        });
    }

    const hasAccess = await checkAccess(parseInt(role_id), permission_name);
    
    res.json({
        success: true,
        hasAccess: hasAccess,
        role_id: parseInt(role_id),
        permission_name: permission_name
    });
};

/**
 * Check if user has specific permission
 */
export const checkUserPermissionAccess = async (req, res) => {
    const { user_id, permission_name } = req.body;
    
    if (!user_id || !permission_name || isNaN(user_id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid user_id and permission_name are required'
        });
    }

    const hasAccess = await checkUserAccess(parseInt(user_id), permission_name);
    
    res.json({
        success: true,
        hasAccess: hasAccess,
        user_id: parseInt(user_id),
        permission_name: permission_name
    });
};