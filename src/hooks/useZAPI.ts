import { useState, useCallback, useEffect, useRef } from 'react';
import { setupWebhookEndpoint, removeWebhookEndpoint } from '../services/zapi/webhookEndpoint';
import { getWebhookUrl } from '../utils/environment';
import type { ZAPIConfig, ZAPIMessage, ZAPIStatus } from '../services/zapi/types';

interface ZAPIServiceRef {
  config: ZAPIConfig;
  request: (endpoint: string, options?: RequestInit) => Promise<any>;
  webhookHandler?: (req: Request) => Promise<Response>;
}

export function useZAPI() {
  const [status, setStatus] = useState<ZAPIStatus | null>(null);
  const [qrCode, setQRCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const serviceRef = useRef<ZAPIServiceRef | null>(null);
  const pollingRef = useRef<number | null>(null);
  const qrCodePollingRef = useRef<number | null>(null);
  const POLLING_INTERVAL = 60000; // 1 minuto

  const cleanup = useCallback(async () => {
    try {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }

      if (qrCodePollingRef.current) {
        clearInterval(qrCodePollingRef.current);
        qrCodePollingRef.current = null;
      }

      if (serviceRef.current) {
        await removeWebhookEndpoint();
        serviceRef.current = null;
      }

      setStatus(null);
      setQRCode(null);
      setError(null);
    } catch (error) {
      console.error('Erro durante cleanup:', error);
    }
  }, []);

  const makeRequest = useCallback(async (config: ZAPIConfig, endpoint: string, options: RequestInit = {}) => {
    const baseUrl = 'https://api.z-api.io';
    const url = `${baseUrl}/instances/${config.instanceId}/token/${config.token}${endpoint}`;

    console.log('Fazendo requisição para:', url);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': config.clientToken,
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Erro na requisição:', errorData);
      throw new Error(errorData?.message || 'Falha na requisição');
    }

    const data = await response.json();
    console.log('Resposta da requisição:', data);
    return data;
  }, []);

  const initialize = useCallback(async (config: ZAPIConfig) => {
    try {
      if (!config.instanceId || !config.token || !config.clientToken) {
        throw new Error('Configuração incompleta');
      }

      const configWithWebhook = {
        ...config,
        webhookUrl: getWebhookUrl()
      };

      await cleanup();

      // Configura o webhook
      const webhookHandler = await setupWebhookEndpoint(configWithWebhook);

      // Configura o serviço
      serviceRef.current = {
        config: configWithWebhook,
        webhookHandler,
        request: (endpoint: string, options?: RequestInit) => makeRequest(configWithWebhook, endpoint, options)
      };

      // Verifica status inicial
      const initialStatus = await serviceRef.current.request('/status');
      setStatus(initialStatus);

      // Inicia polling de status
      pollingRef.current = window.setInterval(async () => {
        try {
          if (!serviceRef.current) return;
          const currentStatus = await serviceRef.current.request('/status');
          setStatus(currentStatus);
        } catch (error) {
          console.error('Erro ao verificar status:', error);
          setStatus({ connected: false, session: 'disconnected' });
        }
      }, POLLING_INTERVAL);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao inicializar ZAPI';
      setError(errorMessage);
      console.error('Erro na inicialização:', error);
      throw error;
    }
  }, [cleanup, makeRequest]);

  const connect = useCallback(async () => {
    if (!serviceRef.current) {
      throw new Error('ZAPI não inicializada');
    }

    setError(null);
    setStatus({ connected: false, session: 'connecting' });

    try {
      const qrCodeResponse = await serviceRef.current.request('/qr-code');
      
      // Mudança aqui: verifica se há algum valor no qrCode, independente da estrutura
      if (qrCodeResponse && (qrCodeResponse.qrcode || qrCodeResponse.value)) {
        setQRCode(qrCodeResponse.qrcode || qrCodeResponse.value);
      } else {
        console.error('Resposta do QR Code:', qrCodeResponse);
        throw new Error('QR Code não disponível');
      }

      qrCodePollingRef.current = window.setInterval(async () => {
        try {
          if (!serviceRef.current) return;
          
          const currentStatus = await serviceRef.current.request('/status');
          
          if (currentStatus.connected) {
            if (qrCodePollingRef.current) {
              clearInterval(qrCodePollingRef.current);
              qrCodePollingRef.current = null;
            }
            setQRCode(null);
            setStatus(currentStatus);
          }
        } catch (error) {
          console.error('Erro ao verificar status:', error);
        }
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao conectar';
      setError(errorMessage);
      setStatus({ connected: false, session: 'disconnected' });
      throw error;
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await cleanup();
      setStatus({ connected: false, session: 'disconnected' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao desconectar';
      setError(errorMessage);
      throw error;
    }
  }, [cleanup]);

  const sendMessage = useCallback(async (message: ZAPIMessage) => {
    if (!serviceRef.current) {
      throw new Error('ZAPI não inicializada');
    }

    if (!status?.connected) {
      throw new Error('WhatsApp não está conectado');
    }

    try {
      setError(null);
      return await serviceRef.current.request('/messages', {
        method: 'POST',
        body: JSON.stringify(message)
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar mensagem';
      setError(errorMessage);
      throw error;
    }
  }, [status]);

  const checkStatus = useCallback(async () => {
    if (!serviceRef.current) {
      throw new Error('ZAPI não inicializada');
    }

    try {
      const currentStatus = await serviceRef.current.request('/status');
      setStatus(currentStatus);
      return currentStatus;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao verificar status';
      setError(errorMessage);
      throw error;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    status,
    qrCode,
    error,
    initialize,
    connect,
    disconnect,
    sendMessage,
    checkStatus,
    isInitialized: !!serviceRef.current
  };
}