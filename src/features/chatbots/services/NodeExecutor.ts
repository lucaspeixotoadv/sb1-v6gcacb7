import type { FlowExecutionNode, FlowExecutionContext, NodeExecutionResult } from '../types/flow';

export class NodeExecutor {
  async executeNode(
    node: FlowExecutionNode, 
    context: FlowExecutionContext
  ): Promise<NodeExecutionResult> {
    try {
      switch (node.data.type) {
        case 'text':
          return await this.executeTextNode(node, context);
        default:
          throw new Error(`Tipo de nó não suportado: ${node.data.type}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  private async executeTextNode(
    node: FlowExecutionNode,
    context: FlowExecutionContext
  ): Promise<NodeExecutionResult> {
    const { content, waitForResponse } = node.data;

    // Processa variáveis no conteúdo
    const processedContent = this.processVariables(content, context.variables);
    
    // Simula o envio da mensagem (você implementará a integração real)
    await this.sendMessage(processedContent);

    // Se precisa esperar resposta do usuário
    if (waitForResponse) {
      try {
        const response = await this.waitForUserResponse(waitForResponse);
        
        // Atualiza a variável com a resposta
        context.updateVariable(waitForResponse.variableName, response);

        return {
          success: true,
          variables: { [waitForResponse.variableName]: response }
        };
      } catch (error) {
        if (error instanceof Error) {
          return { success: false, error: error.message };
        }
        return { success: false, error: 'Erro ao aguardar resposta' };
      }
    }

    return { success: true };
  }

  private processVariables(content: string, variables: Record<string, any>): string {
    return content.replace(/\{(\w+)\}/g, (match, variable) => {
      return variables[variable] ?? match;
    });
  }

  private async sendMessage(content: string): Promise<void> {
    // Implementação real do envio de mensagem
    console.log('Enviando mensagem:', content);
  }

  private async waitForUserResponse(
    config: NonNullable<FlowExecutionNode['data']['waitForResponse']>
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Implementar timeout se configurado
      let timeoutId: NodeJS.Timeout | undefined;
      
      if (config.timeout?.enabled) {
        const timeoutMs = this.calculateTimeoutMs(
          config.timeout.value,
          config.timeout.unit
        );
        
        timeoutId = setTimeout(() => {
          if (config.timeout?.retryEnabled) {
            // Implementar lógica de retry
            console.log('Iniciando retry...');
          } else {
            reject(new Error(config.timeout.message || 'Tempo limite excedido'));
          }
        }, timeoutMs);
      }

      // Aqui você implementará a lógica real de espera por resposta
      // Por exemplo, subscrevendo a eventos de um websocket ou polling
      
      // Mock para teste
      setTimeout(() => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve('Resposta simulada do usuário');
      }, 1000);
    });
  }

  private calculateTimeoutMs(value: number, unit: 'seconds' | 'minutes' | 'hours'): number {
    switch (unit) {
      case 'seconds':
        return value * 1000;
      case 'minutes':
        return value * 60 * 1000;
      case 'hours':
        return value * 60 * 60 * 1000;
    }
  }
}