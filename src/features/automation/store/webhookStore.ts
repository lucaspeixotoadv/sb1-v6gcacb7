import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Webhook, WebhookPayload, WebhookConfig, WebhookRequest } from '../types';

interface WebhookState {
  webhooks: Webhook[];
  requests: WebhookRequest[];
  mockRequests: Record<string, WebhookRequest[]>;
  addWebhook: (data: WebhookPayload) => Webhook;
  updateWebhook: (id: string, data: Partial<Webhook>) => void;
  deleteWebhook: (id: string) => void;
  toggleWebhook: (id: string) => void;
  toggleMode: (id: string) => void;
  updateWebhookConfig: (id: string, config: WebhookConfig) => void;
  addRequest: (webhookId: string, request: Omit<WebhookRequest, 'id' | 'webhookId'>) => void;
  getRequests: (webhookId: string) => WebhookRequest[];
}

export const useWebhookStore = create<WebhookState>()(
  persist(
    (set, get) => ({
      webhooks: [],
      requests: [],
      mockRequests: {
        'form-submission': [
          {
            id: 'req-1',
            webhookId: '',
            timestamp: new Date(),
            method: 'POST',
            headers: {
              'content-type': 'application/json'
            },
            query: {},
            body: {
              nome: 'João Silva',
              telefone: '+5511999999999',
              email: 'joao@email.com',
              empresa: 'Tech Solutions',
              cargo: 'Gerente',
              mensagem: 'Gostaria de um orçamento'
            }
          }
        ],
        'crm-integration': [
          {
            id: 'req-2',
            webhookId: '',
            timestamp: new Date(),
            method: 'POST',
            headers: {
              'content-type': 'application/json'
            },
            query: {},
            body: {
              cliente: {
                nome_completo: 'Maria Santos',
                whatsapp: '+5511988888888',
                email_contato: 'maria@email.com',
                empresa: 'Tech Corp',
                cargo: 'Gerente de Vendas',
                setor: 'Tecnologia'
              }
            }
          }
        ]
      },

      getRequests: (webhookId) => {
        // Retorna requisições mockadas + reais
        const mockType = Math.random() > 0.5 ? 'form-submission' : 'crm-integration';
                        
        const mockData = get().mockRequests[mockType].map(req => ({
          ...req,
          webhookId,
          timestamp: new Date(Date.now() - Math.random() * 86400000) // Últimas 24h
        }));
        
        const allRequests = [...mockData, ...get().requests.filter(req => req.webhookId === webhookId)]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        return allRequests;
      },

      addWebhook: (data) => {
        const webhook: Webhook = {
          id: uuidv4(),
          title: data.title,
          description: data.description,
          url: `${window.location.origin}/api/webhooks/${uuidv4()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          active: true,
          mode: 'test'
        };

        set((state) => ({
          webhooks: [...state.webhooks, webhook]
        }));

        return webhook;
      },

      updateWebhook: (id, data) => {
        set((state) => ({
          webhooks: state.webhooks.map((webhook) =>
            webhook.id === id
              ? { ...webhook, ...data, updatedAt: new Date() }
              : webhook
          )
        }));
      },

      deleteWebhook: (id) => {
        set((state) => ({
          webhooks: state.webhooks.filter((webhook) => webhook.id !== id),
          requests: state.requests.filter((request) => request.webhookId !== id)
        }));
      },

      toggleWebhook: (id) => {
        set((state) => ({
          webhooks: state.webhooks.map((webhook) =>
            webhook.id === id
              ? { ...webhook, active: !webhook.active, updatedAt: new Date() }
              : webhook
          )
        }));
      },

      toggleMode: (id) => {
        set((state) => ({
          webhooks: state.webhooks.map((webhook) =>
            webhook.id === id
              ? {
                  ...webhook,
                  mode: webhook.mode === 'test' ? 'production' : 'test',
                  updatedAt: new Date()
                }
              : webhook
          )
        }));
      },

      updateWebhookConfig: (id, config) => {
        set((state) => ({
          webhooks: state.webhooks.map((webhook) =>
            webhook.id === id
              ? { ...webhook, config, updatedAt: new Date() }
              : webhook
          )
        }));
      },

      addRequest: (webhookId, request) => {
        set((state) => ({
          requests: [
            {
              id: uuidv4(),
              webhookId,
              ...request
            },
            ...state.requests
          ]
        }));
      }
    }),
    {
      name: 'webhook-storage',
      partialize: (state) => ({
        webhooks: state.webhooks,
        requests: state.requests
      })
    }
  )
);