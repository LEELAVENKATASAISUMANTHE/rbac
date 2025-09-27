import { getclient } from '../db/dbset.js';
import dotenv from 'dotenv';

dotenv.config();

async function assignAllPermissionsToAdmin() {
    console.log('Assigning all permissions to admin role (role_id = 1)...');
    
    const client = await getclient();
    try {
        await client.query('BEGIN');
        
        // Get all permissions and assign them to role_id = 1
        const result = await client.query(`
            INSERT INTO rolepermissions (role_id, permission_id)
            SELECT 1, id FROM permissions
            ON CONFLICT (role_id, permission_id) DO NOTHING
            RETURNING *
        `);
        
        console.log(`Assigned ${result.rowCount} permissions to admin role.`);
        
        // Verify the assignments
        const verification = await client.query(`
            SELECT r.name as role_name, p.name as permission_name 
            FROM rolepermissions rp
            JOIN roles r ON rp.role_id = r.id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.role_id = 1
            ORDER BY p.name
        `);
        
        console.log('\nAdmin role now has the following permissions:');
        verification.rows.forEach(row => {
            console.log(`- ${row.permission_name}`);
        });
        
        await client.query('COMMIT');
        console.log('\nPermission assignment completed successfully.');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error assigning permissions to admin role:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run the script if called directly
assignAllPermissionsToAdmin()
    .then(() => {
        console.log('Script completed.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });

export { assignAllPermissionsToAdmin };