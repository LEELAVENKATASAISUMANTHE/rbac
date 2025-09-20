import { getrolebyid, createrole, updaterole, deleterole } from '../db/role.db.js';

/**
 * Get role by ID
 */
export const getRoleById = async (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid role ID is required'
        });
    }

    const role = await getrolebyid(parseInt(id));
    
    if (!role) {
        return res.status(404).json({
            success: false,
            message: 'Role not found'
        });
    }

    res.json({
        success: true,
        data: role
    });
};

/**
 * Create new role
 */
export const createRole = async (req, res) => {
    const { name, description, is_active = true } = req.body;
    
    if (!name) {
        return res.status(400).json({
            success: false,
            message: 'Role name is required'
        });
    }

    const newRole = await createrole(name, description, is_active);
    
    res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: newRole
    });
};

/**
 * Update role
 */
export const updateRole = async (req, res) => {
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid role ID is required'
        });
    }

    const updatedRole = await updaterole(parseInt(id), name, description, is_active);
    
    res.json({
        success: true,
        message: 'Role updated successfully',
        data: updatedRole
    });
};

/**
 * Delete role
 */
export const deleteRole = async (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid role ID is required'
        });
    }

    const deletedRole = await deleterole(parseInt(id));
    
    res.json({
        success: true,
        message: 'Role deleted successfully',
        data: deletedRole
    });
};