import { z } from 'zod';

// Enums
export const SourceTypeSchema = z.enum(['OCR', 'MANUAL']);
export const CurrencyCodeSchema = z.enum(['USD', 'EUR', 'ZAR', 'GBP']);

// Base schemas
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  passwordHash: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const LineItemSchema = z.object({
  id: z.string(),
  receiptId: z.string(),
  description: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number(),
  total: z.number(),
});

export const ReceiptSchema = z.object({
  id: z.string(),
  userId: z.string(),
  sourceType: SourceTypeSchema,
  merchant: z.string().nullable(),
  purchaseDate: z.date().nullable(),
  currency: CurrencyCodeSchema.nullable(),
  total: z.number().nullable(),
  tax: z.number().nullable(),
  notes: z.string().nullable(),
  ocrData: z.any().nullable(),
  fileUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  items: z.array(LineItemSchema).optional(),
});

export const TransactionSchema = z.object({
  id: z.string(),
  receiptId: z.string(),
  bankRef: z.string().nullable(),
  amount: z.number(),
  date: z.date(),
  category: z.string().nullable(),
});

// API Request/Response schemas
export const CreateManualReceiptSchema = z.object({
  merchant: z.string().min(1, 'Merchant name is required'),
  purchaseDate: z.string().datetime(),
  currency: CurrencyCodeSchema,
  tax: z.number().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, 'Item description is required'),
    quantity: z.number().int().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
    total: z.number().positive('Total must be positive'),
  })).min(1, 'At least one item is required'),
});

export const UpdateReceiptSchema = CreateManualReceiptSchema.partial();

export const UploadReceiptSchema = z.object({
  file: z.any(), // File will be validated by multer middleware
});

export const AuthSignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const AuthLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ReceiptListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
  merchant: z.string().optional(),
  sourceType: SourceTypeSchema.optional(),
  currency: CurrencyCodeSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'purchaseDate', 'total', 'merchant']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Type exports
export type SourceType = z.infer<typeof SourceTypeSchema>;
export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;
export type User = z.infer<typeof UserSchema>;
export type Receipt = z.infer<typeof ReceiptSchema>;
export type LineItem = z.infer<typeof LineItemSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type CreateManualReceiptRequest = z.infer<typeof CreateManualReceiptSchema>;
export type UpdateReceiptRequest = z.infer<typeof UpdateReceiptSchema>;
export type AuthSignupRequest = z.infer<typeof AuthSignupSchema>;
export type AuthLoginRequest = z.infer<typeof AuthLoginSchema>;
export type ReceiptListQuery = z.infer<typeof ReceiptListQuerySchema>;

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  token: string;
  expiresAt: string;
}
