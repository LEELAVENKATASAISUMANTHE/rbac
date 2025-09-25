-- Insert permissions from api_docs.md
-- Idempotent: uses ON CONFLICT (name) DO NOTHING

BEGIN;

INSERT INTO permissions (name, description) VALUES
('read_permissions', 'Can read permission information') ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description) VALUES
('read_permissions_id', 'Can read permission by id') ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description) VALUES
('create_permissions', 'Can create permissions') ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description) VALUES
('read_roles', 'Can read roles') ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description) VALUES
('create_roles', 'Can create roles') ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description) VALUES
('update_roles', 'Can update roles') ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description) VALUES
('delete_roles', 'Can delete roles') ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description) VALUES
('read_role_permissions', 'Can read role-permission assignments') ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description) VALUES
('assign_role_permissions', 'Can assign permissions to roles') ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description) VALUES
('delete_role_permissions', 'Can delete role-permission assignments') ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description) VALUES
('create_users', 'Can create users') ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description) VALUES
('read_users', 'Can read users') ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description) VALUES
('delete_users', 'Can delete users') ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description) VALUES
('update_users', 'Can update users') ON CONFLICT (name) DO NOTHING;

COMMIT;

-- End of insert script
