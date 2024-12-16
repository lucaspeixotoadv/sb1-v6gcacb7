// /server/controllers/zapiController.ts
import { Request, Response } from 'express';
import { zapiCredentialsService } from '../services/zapi/credentialsService';
import { logger } from '../utils/logger';

export class ZAPIController {
  static async saveCredentials(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const config = req.body;

      await zapiCredentialsService.saveCredentials(userId, config);

      res.status(200).json({ 
        success: true,
        message: 'Z-API credentials saved successfully'
      });
    } catch (error) {
      logger.error('Failed to save Z-API credentials', { error });
      res.status(500).json({ 
        success: false,
        error: 'Failed to save credentials'
      });
    }
  }

  static async getCredentials(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const config = await zapiCredentialsService.getCredentials(userId);

      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'Credentials not found'
        });
      }

      res.status(200).json({
        success: true,
        data: config
      });
    } catch (error) {
      logger.error('Failed to retrieve Z-API credentials', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve credentials'
      });
    }
  }

  static async removeCredentials(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      await zapiCredentialsService.removeCredentials(userId);

      res.status(200).json({
        success: true,
        message: 'Z-API credentials removed successfully'
      });
    } catch (error) {
      logger.error('Failed to remove Z-API credentials', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to remove credentials'
      });
    }
  }
}