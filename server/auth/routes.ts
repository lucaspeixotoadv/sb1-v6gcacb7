import { Router } from 'express';
import { AuthController } from './controller';
import { asyncHandler } from '../utils/errorHandler';

const router = Router();

// Login route
router.post('/login', asyncHandler(AuthController.login));

// Logout route
router.post('/logout', asyncHandler(AuthController.logout));

// Validate token route
router.get('/validate', asyncHandler(AuthController.validateToken));

export default router;