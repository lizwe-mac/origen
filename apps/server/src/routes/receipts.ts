import { Router } from 'express';
import { CreateManualReceiptSchema, UpdateReceiptSchema, ReceiptListQuerySchema } from '@origen/models';
import { validateBody, validateQuery } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import {
  createManualReceipt,
  uploadReceipt,
  getReceipt,
  updateReceipt,
  listReceipts,
  upload,
} from '../controllers/receiptController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/manual', validateBody(CreateManualReceiptSchema), createManualReceipt);
router.post('/upload', upload.single('file'), uploadReceipt);
router.get('/:id', getReceipt);
router.patch('/:id', validateBody(UpdateReceiptSchema), updateReceipt);
router.get('/', validateQuery(ReceiptListQuerySchema), listReceipts);

export default router;
