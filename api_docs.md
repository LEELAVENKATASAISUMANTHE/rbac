



---
# RBAC API Guide — Frontend Integration

This guide is written for frontend engineers who need to call the RBAC API. It includes base URLs, authentication instructions, headers, axios/fetch snippets, full endpoints with example requests/responses, and useful tips.

## Base URLs

- Local (development):
	- http://localhost:4001
- Deployed (example gateway):
	- https://api-gateway-1258.onrender.com/rbac

> Set your frontend environment variable (e.g. REACT_APP_API_BASE) to the appropriate base URL.

## Authentication & headers

- Auth: `simpleAuth` (JWT or cookie-based session). Include a valid JWT in the `Authorization` header or send cookies if using cookie auth.
- Common headers:
	- Content-Type: application/json
	- Authorization: Bearer <your_jwt_token>

## Axios helper (recommended)

```javascript
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'https://api-gateway-1258.onrender.com/rbac';

export const api = axios.create({
	baseURL: API_BASE,
	headers: { 'Content-Type': 'application/json' },
	withCredentials: true, // set true if using cookies
});

export const setAuthToken = (token) => {
	if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
	else delete api.defaults.headers.common['Authorization'];
};
```

## Endpoints (full URLs + examples)

Notes: each route requires the listed permission (enforced by `requirePermission('<permission>')`) except where noted.

### 1) Roles

- Get role by id
	- GET {BASE}/roles/:id
	- Local:  GET http://localhost:4001/roles/:id
	- Deployed: GET https://api-gateway-1258.onrender.com/rbac/roles/:id
	- Permission: read_roles
	- Example: `const res = await api.get(`/roles/${id}`)`

- Create role
	- POST {BASE}/roles
	- Permission: create_roles
	- Body: { name, description, is_active }
	- Example: `const res = await api.post('/roles', { name, description, is_active })`

- Update role
	- PUT {BASE}/roles/:id
	- Permission: update_roles
	- Example: `const res = await api.put(`/roles/${id}`, { name, description, is_active })`

- Delete role
	- DELETE {BASE}/roles/:id
	- Permission: delete_roles
	- Example: `const res = await api.delete(`/roles/${id}`)`

### 2) Permissions

- List permissions
	- GET {BASE}/permissions
	- Permission: read_permissions
	- Example: `const res = await api.get('/permissions')`

- Get permission by id
	- GET {BASE}/permissions/:id
	- Permission: read_permissions_id
	- Example: `const res = await api.get(`/permissions/${id}`)`

- Create permission
	- POST {BASE}/permissions
	- Permission: create_permissions
	- Body: { name, description }
	- Example: `const res = await api.post('/permissions', { name, description })`

- Delete permission
	- DELETE {BASE}/permissions/:id
	- Permission: delete_permissions
	- Example: `const res = await api.delete(`/permissions/${id}`)`

### 3) Role-Permissions

- Get permissions for a role
	- GET {BASE}/role-permissions/:roleId
	- Permission: read_role_permissions
	- Example: `const res = await api.get(`/role-permissions/${roleId}`)`

- Assign permission to role
	- POST {BASE}/role-permissions
	- Permission: assign_role_permissions
	- Body: { role_id, permission_id }
	- Example: `const res = await api.post('/role-permissions', { role_id, permission_id })`

- Remove permission from role
	- DELETE {BASE}/role-permissions
	- Permission: delete_role_permissions
	- Body: { role_id, permission_id }
	- Example: `const res = await api.delete('/role-permissions', { data: { role_id, permission_id } })`

- Check access (does role have permission?)
	- POST {BASE}/role-permissions/check-access
	- Body: { role_id, permission_name }
	- Note: the current implementation does not require a specific permission for this check endpoint
	- Example: `const res = await api.post('/role-permissions/check-access', { role_id, permission_name })`

### 4) Users

- Register (create user)
	- POST {BASE}/users/register
	- Permission: create_users
	- Body: { name, email, password, role_id }
	- Example: `const res = await api.post('/users/register', { name, email, password, role_id })`

- Current user
	- GET {BASE}/users/me
	- Permission: read_users
	- Example: `const res = await api.get('/users/me')`

- Update user
	- PUT {BASE}/users/:id
	- Permission: update_users
	- Body: { name?, email?, role_id? }
	- Example: `const res = await api.put(`/users/${id}`, { name, email, role_id })`

- Delete user
	- DELETE {BASE}/users/:id
	- Permission: delete_users
	- Example: `const res = await api.delete(`/users/${id}`)`

## Helpful frontend patterns

- Error handling (axios):

```javascript
try {
	const res = await api.get('/permissions');
	return res.data;
} catch (err) {
	if (err.response) {
		// server responded with non-2xx
		console.error(err.response.status, err.response.data);
	} else {
		// network error or no response
		console.error(err.message);
	}
	throw err;
}
```

- Using fetch example:

```javascript
const res = await fetch(`${API_BASE}/permissions`, {
	headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
});
const data = await res.json();
```

- Retry & idempotency:
	- For create (POST) calls consider adding client-side checks or server-generated idempotency keys. The backend provides unique constraints (e.g., permission name) to avoid duplicates.

## Security & CORS

- Ensure the frontend origin is allowed in backend CORS configuration or that the gateway proxies requests.
- Prefer httpOnly cookies for session tokens when possible to reduce XSS risk. If using local storage for tokens, ensure strict Content Security Policy and input sanitization.

## Seeding & admin bootstrapping

- Seed permissions: `node scripts/seed_permissions.js` or run `scripts/insert_permissions.sql` with psql.
- `setup.js` will create default roles and assign permissions to the admin role (role_id = 1) during initial setup.

## Extras I can provide

- Export to OpenAPI/Swagger JSON or YAML for import into Postman/Swagger UI.
- Generate a Postman collection with examples and pre-configured auth variables.

---
 


