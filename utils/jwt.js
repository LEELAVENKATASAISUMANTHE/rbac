import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const simpleAuth = (req, res, next) => {
    const authHeader = req.cookies.accessToken;
    if (!authHeader) {
        return res.status(401).json({
          success:false,
          message:'accessToken cookie not found'
        })
    }


    jwt.verify(authHeader, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          console.error('JWT verification error:', err);
            return res.status(403).json({
              success:false,
              message:'Invalid token',
              error: err.message
            });
        }

        // Normalize token payload to a consistent shape consumed by authMiddleware
        // Some tokens include user fields at top-level, others nest under `user`.
        const normalizedUser = decoded && decoded.user ? decoded.user : decoded;

        // If role is provided as `role` (not role_id), copy it to role_id for consistency
        if (normalizedUser && normalizedUser.role !== undefined && normalizedUser.role_id === undefined) {
            normalizedUser.role_id = normalizedUser.role;
        }
        console.log('Normalized user from token:', normalizedUser);
  // Attach normalized user at top-level so existing middleware can read req.user.role_id
  req.user = normalizedUser;
  // keep full decoded token available for handlers if needed
  req.jwt = decoded;
        next();
    });
};
