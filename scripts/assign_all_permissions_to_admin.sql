-- Assign all permissions to role ID 1 (Admin role)
-- This script grants full access to the admin role
-- Idempotent: uses ON CONFLICT DO NOTHING to avoid duplicate entries

BEGIN;

-- Assign all existing permissions to role_id = 1
-- Uses a subquery to get all permission IDs and assigns them to role 1
INSERT INTO rolepermissions (role_id, permission_id)
SELECT 1, id FROM permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Alternative approach: Explicit assignments for each permission
-- Uncomment the lines below if you prefer explicit assignments

-- INSERT INTO rolepermissions (role_id, permission_id) 
-- SELECT 1, id FROM permissions WHERE name = 'read_permissions' 
-- ON CONFLICT (role_id, permission_id) DO NOTHING;

-- INSERT INTO rolepermissions (role_id, permission_id) 
-- SELECT 1, id FROM permissions WHERE name = 'read_permissions_id' 
-- ON CONFLICT (role_id, permission_id) DO NOTHING;

-- INSERT INTO rolepermissions (role_id, permission_id) 
-- SELECT 1, id FROM permissions WHERE name = 'create_permissions' 
-- ON CONFLICT (role_id, permission_id) DO NOTHING;

-- INSERT INTO rolepermissions (role_id, permission_id) 
-- SELECT 1, id FROM permissions WHERE name = 'delete_permissions' 
-- ON CONFLICT (role_id, permission_id) DO NOTHING;

-- INSERT INTO rolepermissions (role_id, permission_id) 
-- SELECT 1, id FROM permissions WHERE name = 'read_roles' 
-- ON CONFLICT (role_id, permission_id) DO NOTHING;

-- INSERT INTO rolepermissions (role_id, permission_id) 
-- SELECT 1, id FROM permissions WHERE name = 'create_roles' 
-- ON CONFLICT (role_id, permission_id) DO NOTHING;

-- INSERT INTO rolepermissions (role_id, permission_id) 
-- SELECT 1, id FROM permissions WHERE name = 'update_roles' 
-- ON CONFLICT (role_id, permission_id) DO NOTHING;

-- INSERT INTO rolepermissions (role_id, permission_id) 
-- SELECT 1, id FROM permissions WHERE name = 'delete_roles' 
-- ON CONFLICT (role_id, permission_id) DO NOTHING;

-- INSERT INTO rolepermissions (role_id, permission_id) 
-- SELECT 1, id FROM permissions WHERE name = 'read_role_permissions' 
-- ON CONFLICT (role_id, permission_id) DO NOTHING;

-- INSERT INTO rolepermissions (role_id, permission_id) 
-- SELECT 1, id FROM permissions WHERE name = 'assign_role_permissions' 
-- ON CONFLICT (role_id, permission_id) DO NOTHING;

-- INSERT INTO rolepermissions (role_id, permission_id) 
-- SELECT 1, id FROM permissions WHERE name = 'delete_role_permissions' 
-- ON CONFLICT (role_id, permission_id) DO NOTHING;

-- INSERT INTO rolepermissions (role_id, permission_id) 
-- SELECT 1, id FROM permissions WHERE name = 'create_users' 
-- ON CONFLICT (role_id, permission_id) DO NOTHING;

-- INSERT INTO rolepermissions (role_id, permission_id) 
-- SELECT 1, id FROM permissions WHERE name = 'read_users' 
-- ON CONFLICT (role_id, permission_id) DO NOTHING;

-- INSERT INTO rolepermissions (role_id, permission_id) 
-- SELECT 1, id FROM permissions WHERE name = 'read_user' 
-- ON CONFLICT (role_id, permission_id) DO NOTHING;

-- INSERT INTO rolepermissions (role_id, permission_id) 
-- SELECT 1, id FROM permissions WHERE name = 'update_users' 
-- ON CONFLICT (role_id, permission_id) DO NOTHING;

-- INSERT INTO rolepermissions (role_id, permission_id) 
-- SELECT 1, id FROM permissions WHERE name = 'delete_users' 
-- ON CONFLICT (role_id, permission_id) DO NOTHING;

COMMIT;

-- Verification query (optional - run separately to check results)
-- SELECT r.name as role_name, p.name as permission_name 
-- FROM rolepermissions rp
-- JOIN roles r ON rp.role_id = r.id
-- JOIN permissions p ON rp.permission_id = p.id
-- WHERE rp.role_id = 1
-- ORDER BY p.name;