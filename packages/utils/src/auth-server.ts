import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Server-only auth functions that use Node.js libraries
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload: object, secret: string, expiresIn: string = '7d'): string => {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const verifyToken = (token: string, secret: string): any => {
  return jwt.verify(token, secret);
};

export const getTokenExpiry = (expiresIn: string = '7d'): Date => {
  const now = new Date();
  const days = parseInt(expiresIn.replace('d', ''));
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
};
