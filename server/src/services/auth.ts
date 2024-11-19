import type { Request } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Define the payload structure
interface JwtPayload {
  _id: string;
  username: string;
  email: string;
}

// Middleware for Apollo Server context
export const authenticateToken = ({ req }: { req: Request }) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    const secretKey = process.env.JWT_SECRET_KEY || '';

    try {
      const decoded = jwt.verify(token, secretKey) as JwtPayload;
      return { user: decoded }; // Attach user data to GraphQL context
    } catch (err) {
      console.error('Invalid token:', err);
    }
  }

  return { user: null }; // Return null user for unauthenticated requests
};

// Function to sign a token
export const signToken = (username: string, email: string, _id: string) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};
