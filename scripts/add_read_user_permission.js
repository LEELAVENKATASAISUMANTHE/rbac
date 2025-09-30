import { getclient } from '../db/dbset.js';
import dotenv from 'dotenv';

dotenv.config();

async function addReadUserPermission() {
    console.log('Adding read_user permission and assigning to admin role...');
    
    const client = await getclient();
    try {
        await client.query('BEGIN');
        
        // 1. Add the permission if it doesn't exist
        console.log('Adding read_user permission...');
        const insertPermResult = await client.query(`
            INSERT INTO permissions (name, description) 
            VALUES ('read_user', 'Can read a specific user by ID') 
            ON CONFLICT (name) DO NOTHING
            RETURNING id
        `);
        
        if (insertPermResult.rowCount > 0) {
            console.log(`Created permission 'read_user' with ID ${insertPermResult.rows[0].id}`);
        } else {
            // Get the ID if permission already existed
            const existingPerm = await client.query(`
                SELECT id FROM permissions WHERE name = 'read_user'
            `);
            console.log(`Permission 'read_user' already exists with ID ${existingPerm.rows[0].id}`);
        }
        
        // 2. Assign the permission to the admin role
        console.log('Assigning read_user permission to admin role (role_id = 1)...');
        const assignResult = await client.query(`
            INSERT INTO rolepermissions (role_id, permission_id)
            SELECT 1, id FROM permissions WHERE name = 'read_user'
            ON CONFLICT (role_id, permission_id) DO NOTHING
            RETURNING *
        `);
        
        if (assignResult.rowCount > 0) {
            console.log(`Assigned 'read_user' permission to admin role.`);
        } else {
            console.log(`Permission 'read_user' was already assigned to admin role.`);
        }
        
        // 3. Verify all admin permissions
        const verification = await client.query(`
            SELECT r.name as role_name, p.name as permission_name 
            FROM rolepermissions rp
            JOIN roles r ON rp.role_id = r.id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.role_id = 1
            ORDER BY p.name
        `);
        
        console.log('\nAdmin role has the following permissions:');
        verification.rows.forEach(row => {
            console.log(`- ${row.permission_name}`);
        });
        
        await client.query('COMMIT');
        console.log('\nPermission setup completed successfully.');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error setting up read_user permission:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run the script
addReadUserPermission()
    .then(() => {
        console.log('Script completed.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });