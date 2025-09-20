/**
 * Simple authentication middleware for testing
 * In production, replace this with JWT authentication or your preferred auth method
 */

export const simpleAuth = (req, res, next) => {
    // For testing purposes - you can set user data manually
    // In production, extract from JWT token or session
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'No authorization header provided'
        });
    }

    // Simple format: "Bearer role_id:user_id" (for testing)
    // Example: "Bearer 1:123" means role_id=1, user_id=123
    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }

    try {
        // Parse simple token format: "role_id:user_id"
        const [role_id, user_id] = token.split(':');
        
        if (!role_id || !user_id) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format. Use: role_id:user_id'
            });
        }

        // Set user object for use in permission middleware
        req.user = {
            id: parseInt(user_id),
            role_id: parseInt(role_id)
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

/**
 * Mock user data for testing (optional)
 */
export const mockUsers = {
    1: { id: 1, role_id: 1, name: 'Admin User', email: 'admin@example.com' },
    2: { id: 2, role_id: 2, name: 'Manager User', email: 'manager@example.com' },
    3: { id: 3, role_id: 3, name: 'Regular User', email: 'user@example.com' }
};

/**
 * Alternative auth middleware that uses predefined users (for testing)
 */
export const mockAuth = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: 'No user ID provided in x-user-id header'
        });
    }

    const user = mockUsers[parseInt(userId)];
    
    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'User not found'
        });
    }

    req.user = user;
    next();
};