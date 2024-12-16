import { useCallback } from 'react';
import type { TextNodeData, NodeValidation } from '../types/nodes';

export function useNodeValidation() {
  const validateTextNode = useCallback((data: TextNodeData): NodeValidation => {
    const errors: string[] = [];

    if (!data.content?.trim()) {
      errors.push('O conteúdo da mensagem é obrigatório');
    }

    if (data.waitForResponse) {
      if (!data.waitForResponse.variableName?.trim()) {
        errors.push('O nome da variável é obrigatório quando aguardando resposta');
      }

      if (data.waitForResponse.timeout?.enabled) {
        if (!data.waitForResponse.timeout.value || data.waitForResponse.timeout.value < 1) {
          errors.push('O valor do timeout deve ser maior que 0');
        }

        if (data.waitForResponse.timeout.retryEnabled) {
          if (!data.waitForResponse.timeout.maxRetries || data.waitForResponse.timeout.maxRetries < 1) {
            errors.push('O número máximo de tentativas deve ser maior que 0');
          }
          if (!data.waitForResponse.timeout.retryDelay || data.waitForResponse.timeout.retryDelay < 1) {
            errors.push('O intervalo entre tentativas deve ser maior que 0');
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  return {
    validateTextNode
  };
}