// /server/routes/zapi.ts
import { Router } from 'express';
import { ZAPIController } from '../controllers/zapiController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post(
  '/zapi/credentials/:userId',
  authMiddleware,
  ZAPIController.saveCredentials
);

router.get(
  '/zapi/credentials/:userId',
  authMiddleware,
  ZAPIController.getCredentials
);

router.delete(
  '/zapi/credentials/:userId',
  authMiddleware,
  ZAPIController.removeCredentials
);

export default router;