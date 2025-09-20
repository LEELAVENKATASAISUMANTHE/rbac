import jwt from 'jsonwebtoken';

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

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          console.error('JWT verification error:', err);
            return res.status(403).json({
              success:false,
              message:'Invalid token',
              erreor: err.message
            });
        }
        req.user = user;
        next();
    });
};
