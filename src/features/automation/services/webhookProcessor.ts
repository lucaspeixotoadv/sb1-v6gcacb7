import { useContacts } from '../../../hooks/useContacts';
import { useSettings } from '../../../hooks/useSettings';
import type { WebhookRequest, WebhookConfig } from '../types';

interface ProcessedData {
  phone: string;
  name?: string;
  email?: string;
  customFields?: Record<string, string>;
  tags?: string[];
}

export function processWebhookData(request: WebhookRequest, config: WebhookConfig): ProcessedData | null {
  try {
    // Função auxiliar para extrair valor do payload usando path (ex: "data.customer.phone")
    const extractValue = (obj: any, path: string): any => {
      return path.split('.').reduce((acc, part) => acc?.[part], obj);
    };

    // Extrai o telefone (obrigatório)
    const phone = extractValue(request.body, config.fieldMappings.phone?.field || '');
    if (!phone) {
      console.error('Campo de telefone obrigatório não encontrado no payload');
      return null;
    }

    // Processa dados básicos
    const processedData: ProcessedData = {
      phone: phone.toString().replace(/\D/g, ''), // Remove não-dígitos
      tags: config.tags || []
    };

    // Extrai nome se configurado
    if (config.fieldMappings.name?.field) {
      const name = extractValue(request.body, config.fieldMappings.name.field);
      if (name) processedData.name = name.toString();
    }

    // Extrai campos personalizados
    if (config.fieldMappings.customFields) {
      processedData.customFields = {};
      
      for (const [key, mapping] of Object.entries(config.fieldMappings.customFields)) {
        const value = extractValue(request.body, mapping.field);
        if (value !== undefined) {
          processedData.customFields[key] = value.toString();
        }
      }
    }

    return processedData;
  } catch (error) {
    console.error('Erro ao processar dados do webhook:', error);
    return null;
  }
}