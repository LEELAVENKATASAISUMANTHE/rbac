import { createpermission, getpermissionbyid, getallpermissions,deletepermission } from '../db/permission.db.js';

/**
 * Get all permissions
 */
export const getAllPermissions = async (req, res) => {
    console.log("Get All Permissions Called");
    const permissions = await getallpermissions();
    
    res.json({
        success: true,
        count: permissions.length,
        data: permissions
    });
};

/**
 * Get permission by ID
 */
export const getPermissionById = async (req, res) => {
    console.log("Get Permission By ID Called");
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid permission ID is required'
        });
    }

    const permission = await getpermissionbyid(parseInt(id));
    
    if (!permission) {
        return res.status(404).json({
            success: false,
            message: 'Permission not found'
        });
    }

    res.json({
        success: true,
        data: permission
    });
};

/**
 * Create new permission
 */
export const createPermission = async (req, res) => {
    console.log('Create Permission Called');
    const { name, description } = req.body;
    
    if (!name) {
        return res.status(400).json({
            success: false,
            message: 'Permission name is required'
        });
    }

    const newPermission = await createpermission(name, description);
    
    res.status(201).json({
        success: true,
        message: 'Permission created successfully',
        data: newPermission
    });
};

export const deletePermission = async (req, res) => {
    console.log("Delete Permission Called");
    const { id } = req.params;
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid permission ID is required'
        });
    }
    const success = await deletepermission(parseInt(id));
    if (!success) {
        return res.status(404).json({
            success: false,
            message: 'Permission not found'
        });
    }

    res.json({
        success: true,
        message: 'Permission deleted successfully'
    });
};
