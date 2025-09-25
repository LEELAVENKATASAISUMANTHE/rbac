import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const simpleAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
          success:false,
          message:'No authorization header provided'
        })
    }

    const token = authHeader.split(' ')[1];
    console.log("Token:", token);

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
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

  // Attach normalized user at top-level so existing middleware can read req.user.role_id
  req.user = normalizedUser;
  // keep full decoded token available for handlers if needed
  req.jwt = decoded;
        next();
    });
};
