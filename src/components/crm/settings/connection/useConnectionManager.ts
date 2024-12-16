// /src/components/crm/settings/connection/useConnectionManager.ts
import { useState, useEffect } from 'react';
import { useMessaging } from '@/contexts/MessagingContext';
import { useAuth } from '@/contexts/auth'; // Assumindo que temos este hook
import { zapiCredentialsManager } from '@/services/security/zapiCredentialsManager';
import type { ZAPIConfig } from '@/services/zapi/types';
import { logger } from '@/utils/logger';

const initialConfig: ZAPIConfig = {
  instanceId: '',
  token: '',
  clientToken: '',
  webhookUrl: ''
};

export function useConnectionManager() {
  const [config, setConfig] = useState<ZAPIConfig>(initialConfig);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { initialize, connect, status, qrCode } = useMessaging();
  const { user } = useAuth();

  useEffect(() => {
    async function loadConfig() {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const savedConfig = await zapiCredentialsManager.getCredentials(user.id);
        
        if (savedConfig) {
          setConfig(savedConfig);
          setIsConfigured(true);
          initialize(savedConfig);
        }
      } catch (error) {
        logger.error('Error loading Z-API config', { error });
      } finally {
        setIsLoading(false);
      }
    }

    loadConfig();
  }, [initialize, user?.id]);

  useEffect(() => {
    let connectAttempt: NodeJS.Timeout;
    
    if (showQRCode && isConfigured) {
      connectAttempt = setTimeout(() => {
        connect().catch((error) => {
          logger.error('Error requesting QR code', { error });
        });
      }, 500);
    }

    return () => {
      if (connectAttempt) {
        clearTimeout(connectAttempt);
      }
    };
  }, [showQRCode, isConfigured, connect]);

  const handleSaveConfig = async (newConfig: ZAPIConfig) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      await zapiCredentialsManager.saveCredentials(user.id, newConfig);
      
      setConfig(newConfig);
      setIsConfigured(true);
      initialize(newConfig);

      logger.info('Z-API configuration saved successfully');
    } catch (error) {
      logger.error('Error saving Z-API config', { error });
      throw new Error('Failed to save Z-API configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user?.id) return;

    if (window.confirm('Are you sure you want to disconnect? You will need to reconfigure your credentials.')) {
      try {
        setIsLoading(true);
        await zapiCredentialsManager.removeCredentials(user.id);
        
        setIsConfigured(false);
        setConfig(initialConfig);
        setShowQRCode(false);

        logger.info('Z-API configuration removed successfully');
      } catch (error) {
        logger.error('Error removing Z-API config', { error });
        throw new Error('Failed to remove Z-API configuration');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const checkConfiguration = async () => {
    if (!user?.id) return false;
    return zapiCredentialsManager.isConfigured(user.id);
  };

  return {
    config,
    isConfigured,
    showQRCode,
    status,
    qrCode,
    isLoading,
    handleSaveConfig,
    handleDisconnect,
    setShowQRCode,
    checkConfiguration
  };
}