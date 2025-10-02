import { getrolebyid, createrole, updaterole, deleterole,getallroles } from '../db/role.db.js';

/**
 * Get role by ID
 */
export const getRoleById = async (req, res) => {
    console.log("Get Role By ID Called");
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
    console.log('Create Role Called');
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
    console.log("Update Role Called");
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
    console.log("Delete Role Called");
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

export const getAllRoles = async (req, res) => {
console.log("Get All Roles Called");
    try {
         const roles = await getallroles();
    res.json({
        success: true,
        data: roles
    });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve roles',
            error: error.message
        });
    }
   
};
