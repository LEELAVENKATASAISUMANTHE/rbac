import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { storerefreshToken, validateRefreshToken } from '../db/login.db.js';

export async function generateTokens(user) {
  console.log("Generating tokens for user:", user); 
  const accessToken = jwt.sign(
    { 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        is_active: user.is_active
      }
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = randomBytes(40).toString('hex'); // opaque
  // Save in DB for later verification / revocation
  const expiryDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
  // Convert to UTC timestamp string without timezone info
  const formattedExpiry = expiryDate.toISOString().replace('T', ' ').replace('Z', '');
  
  await storerefreshToken(user.id, refreshToken, formattedExpiry);
  return { accessToken, refreshToken };
}



export async function verifyRefreshToken(token) {
  try {
    if (!token) {
      throw new Error('Refresh token is required');
    }
    
    // Validate the refresh token against the database
    const userId = await validateRefreshToken(token);
    
    if (!userId) {
      throw new Error('Invalid or expired refresh token');
    }
    
    return { valid: true, userId };
  } catch (error) {
    console.error("Error verifying refresh token:", error);
    throw error;
  }
}


export async function verifyAccessToken(token) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload; // { sub: userId, role: roleId, iat: ..., exp: ... }
  } catch (error) {
    console.error("Error verifying access token:", error);
    throw error;
  } 
}