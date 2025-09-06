import { Router } from 'express';
import { AuthSignupSchema, AuthLoginSchema } from '@origen/models';
import { validateBody } from '../middleware/validation';
import { signup, login } from '../controllers/authController';

const router = Router();

router.post('/signup', validateBody(AuthSignupSchema), signup);
router.post('/login', validateBody(AuthLoginSchema), login);

export default router;
