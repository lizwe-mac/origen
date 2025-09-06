import { Request, Response } from 'express';
import { AuthSignupSchema, AuthLoginSchema, type AuthResponse } from '@origen/models';
import { hashPassword, comparePassword, generateToken, getTokenExpiry } from '@origen/utils/server';
import { prisma } from '../config/database';

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User with this email already exists',
          code: 'USER_EXISTS',
        },
      });
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      process.env.JWT_EXPIRES_IN
    );

    const response: AuthResponse = {
      user,
      token,
      expiresAt: getTokenExpiry(process.env.JWT_EXPIRES_IN).toISOString(),
    };

    res.status(201).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    // More specific error handling
    let errorMessage = 'Failed to create user';
    let errorCode = 'SIGNUP_ERROR';
    
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Check for specific database errors
      if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Database connection failed';
        errorCode = 'DATABASE_CONNECTION_ERROR';
      } else if (error.message.includes('Prisma')) {
        errorMessage = 'Database operation failed';
        errorCode = 'DATABASE_ERROR';
      } else if (error.message.includes('JWT') || error.message.includes('secret')) {
        errorMessage = 'Authentication configuration error';
        errorCode = 'AUTH_CONFIG_ERROR';
      }
    }
    
    res.status(500).json({
      success: false,
      error: {
        message: errorMessage,
        code: errorCode,
      },
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    // Generate JWT token
    const token = generateToken(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      process.env.JWT_EXPIRES_IN
    );

    const response: AuthResponse = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
      expiresAt: getTokenExpiry(process.env.JWT_EXPIRES_IN).toISOString(),
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to authenticate user',
        code: 'LOGIN_ERROR',
      },
    });
  }
};
