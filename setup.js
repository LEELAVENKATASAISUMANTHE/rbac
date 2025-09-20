import { getclient } from './db/dbset.js';
import dotenv from 'dotenv';

dotenv.config();

async function setupRBAC() {
    const client = await getclient();
    
    try {
        console.log('🚀 Setting up complete RBAC system...\n');
        
        // Step 1: Create tables if they don't exist
        console.log('📋 Creating database tables...');
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL,
                description TEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS permissions (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS rolepermissions (
                id SERIAL PRIMARY KEY,
                role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
                permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(role_id, permission_id)
            )
        `);
        
        console.log('✅ Database tables ready');
        
        // Step 2: Create default permissions
        console.log('\n📝 Creating default permissions...');
        const defaultPermissions = [
            { name: 'read_roles', description: 'Can read role information' },
            { name: 'manage_roles', description: 'Can create, update, delete roles' },
            { name: 'read_permissions', description: 'Can read permission information' },
            { name: 'manage_permissions', description: 'Can create permissions' },
            { name: 'read_role_permissions', description: 'Can read role-permission assignments' },
            { name: 'manage_role_permissions', description: 'Can assign/remove permissions from roles' },
            { name: 'admin_access', description: 'Full administrative access' },
            { name: 'read_users', description: 'Can read user information' },
            { name: 'write_users', description: 'Can create and update users' },
            { name: 'delete_users', description: 'Can delete users' }
        ];
        
        for (const perm of defaultPermissions) {
            await client.query(
                'INSERT INTO permissions (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
                [perm.name, perm.description]
            );
            console.log(`✅ ${perm.name}`);
        }
        
        // Step 3: Create admin role
        console.log('\n👤 Creating admin role...');
        await client.query(`
            INSERT INTO roles (id, name, description, is_active) 
            VALUES (1, 'admin', 'Administrator with full system access', true)
            ON CONFLICT (id) DO UPDATE SET 
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                is_active = EXCLUDED.is_active
        `);
        console.log('✅ Admin role (ID: 1) ready');
        
        // Step 4: Assign all permissions to admin role
        console.log('\n🔑 Assigning all permissions to admin role...');
        await client.query(`
            INSERT INTO rolepermissions (role_id, permission_id)
            SELECT 1, id FROM permissions
            ON CONFLICT (role_id, permission_id) DO NOTHING
        `);
        
        // Step 5: Verify setup
        const result = await client.query(`
            SELECT 
                COUNT(*) as total_permissions,
                array_agg(p.name ORDER BY p.name) as permission_names
            FROM permissions p
            JOIN rolepermissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = 1
        `);
        
        const adminPermissions = result.rows[0];
        
        console.log('\n🎉 RBAC Setup completed successfully!');
        console.log(`📊 Admin role now has ${adminPermissions.total_permissions} permissions:`);
        adminPermissions.permission_names.forEach(name => {
            console.log(`   ✓ ${name}`);
        });
        
        console.log('\n💡 Usage:');
        console.log('• Use role_id=1 for admin users');
        console.log('• Test API with: Authorization: Bearer 1:123');
        console.log('• Server: npm run dev');
        
    } catch (error) {
        console.error('💥 Setup failed:', error);
        process.exit(1);
    } finally {
        client.release();
        process.exit(0);
    }
}

setupRBAC();