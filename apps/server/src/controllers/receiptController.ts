import { Request, Response } from 'express';
import { CreateManualReceiptSchema, UpdateReceiptSchema, ReceiptListQuerySchema } from '@origen/models';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
});

export const createManualReceipt = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { merchant, purchaseDate, currency, tax, notes, items } = req.body;
    const userId = req.user!.id;

    // Calculate total from items
    const calculatedTotal = items.reduce((sum: number, item: any) => sum + item.total, 0);

    const receipt = await prisma.receipt.create({
      data: {
        userId,
        sourceType: 'MANUAL',
        merchant,
        purchaseDate: new Date(purchaseDate),
        currency,
        total: calculatedTotal,
        tax,
        notes,
        ocrData: null,
        fileUrl: null,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    console.error('Create manual receipt error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create receipt',
        code: 'CREATE_RECEIPT_ERROR',
      },
    });
  }
};

export const uploadReceipt = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No file uploaded',
          code: 'NO_FILE',
        },
      });
    }

    const userId = req.user!.id;
    const fileUrl = req.file.path;

    // TODO: Implement OCR processing here
    // For now, we'll create a placeholder OCR data
    const mockOcrData = {
      merchant: 'Extracted Merchant',
      total: 25.99,
      date: new Date().toISOString(),
      items: [
        {
          description: 'Extracted Item',
          quantity: 1,
          unitPrice: 25.99,
          total: 25.99,
        },
      ],
      confidence: 0.85,
    };

    const receipt = await prisma.receipt.create({
      data: {
        userId,
        sourceType: 'OCR',
        merchant: mockOcrData.merchant,
        purchaseDate: new Date(mockOcrData.date),
        currency: 'USD',
        total: mockOcrData.total,
        ocrData: mockOcrData,
        fileUrl,
        items: {
          create: mockOcrData.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    console.error('Upload receipt error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to process uploaded receipt',
        code: 'UPLOAD_RECEIPT_ERROR',
      },
    });
  }
};

export const getReceipt = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const receipt = await prisma.receipt.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        items: true,
        transaction: true,
      },
    });

    if (!receipt) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Receipt not found',
          code: 'RECEIPT_NOT_FOUND',
        },
      });
    }

    res.json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch receipt',
        code: 'GET_RECEIPT_ERROR',
      },
    });
  }
};

export const updateReceipt = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const updateData = req.body;

    // Check if receipt exists and belongs to user
    const existingReceipt = await prisma.receipt.findFirst({
      where: { id, userId },
      include: { items: true },
    });

    if (!existingReceipt) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Receipt not found',
          code: 'RECEIPT_NOT_FOUND',
        },
      });
    }

    // Update receipt and items in a transaction
    const updatedReceipt = await prisma.$transaction(async (tx) => {
      // Delete existing items
      await tx.lineItem.deleteMany({
        where: { receiptId: id },
      });

      // Calculate new total if items are provided
      let calculatedTotal = updateData.total;
      if (updateData.items) {
        calculatedTotal = updateData.items.reduce((sum: number, item: any) => sum + item.total, 0);
      }

      // Update receipt
      const receipt = await tx.receipt.update({
        where: { id },
        data: {
          ...updateData,
          total: calculatedTotal,
          purchaseDate: updateData.purchaseDate ? new Date(updateData.purchaseDate) : undefined,
          items: updateData.items ? {
            create: updateData.items.map((item: any) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
            })),
          } : undefined,
        },
        include: {
          items: true,
        },
      });

      return receipt;
    });

    res.json({
      success: true,
      data: updatedReceipt,
    });
  } catch (error) {
    console.error('Update receipt error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update receipt',
        code: 'UPDATE_RECEIPT_ERROR',
      },
    });
  }
};

export const listReceipts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      page = 1,
      limit = 20,
      merchant,
      sourceType,
      currency,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query as any;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId };
    
    if (merchant) {
      where.merchant = { contains: merchant, mode: 'insensitive' };
    }
    if (sourceType) {
      where.sourceType = sourceType;
    }
    if (currency) {
      where.currency = currency;
    }
    if (startDate || endDate) {
      where.purchaseDate = {};
      if (startDate) where.purchaseDate.gte = new Date(startDate);
      if (endDate) where.purchaseDate.lte = new Date(endDate);
    }

    // Get receipts and total count
    const [receipts, total] = await Promise.all([
      prisma.receipt.findMany({
        where,
        include: {
          items: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.receipt.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        data: receipts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error('List receipts error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch receipts',
        code: 'LIST_RECEIPTS_ERROR',
      },
    });
  }
};
