import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Pipeline, Deal } from '../types';

// Tempo de polling em desenvolvimento (5 segundos)
const POLL_INTERVAL = 5000;

interface PipelineService {
  fetchPipelines(): Promise<Pipeline[]>;
  updatePipeline(id: string, data: Partial<Pipeline>): Promise<void>;
  moveDeal(dealId: string, targetStageId: string): Promise<void>;
  addDeal(deal: Partial<Deal>): Promise<Deal>;
  updateDeal(id: string, data: Partial<Deal>): Promise<void>;
  deleteDeal(id: string): Promise<void>;
}

// Implementação mock do serviço para desenvolvimento
const mockPipelineService: PipelineService = {
  async fetchPipelines() {
    return initialPipelines;
  },
  async updatePipeline() {},
  async moveDeal() {},
  async addDeal(deal) {
    return {
      id: uuidv4(),
      ...deal
    } as Deal;
  },
  async updateDeal() {},
  async deleteDeal() {}
};

const initialPipeline: Pipeline = {
  id: '1',
  name: 'Vendas B2B',
  type: 'sales',
  color: '#4F46E5',
  stages: [
    {
      id: 'prospecting',
      name: 'Prospecção',
      order: 0,
      color: '#E5E7EB',
      deals: [
        {
          id: '1',
          title: 'Implantação ERP',
          value: 150000,
          contactId: '1',
          stage: 'prospecting',
          priority: 'high',
          status: 'active',
          createdAt: new Date('2024-03-01'),
          updatedAt: new Date('2024-03-10'),
          tags: ['Software', 'Enterprise'],
          customFields: {
            'empresa': 'Tech Solutions',
            'setor': 'Tecnologia'
          },
          dueDate: new Date('2024-04-15')
        },
        {
          id: '2',
          title: 'Consultoria Estratégica',
          value: 75000,
          contactId: '2',
          stage: 'prospecting',
          priority: 'medium',
          status: 'active',
          createdAt: new Date('2024-03-05'),
          updatedAt: new Date('2024-03-10'),
          tags: ['Consultoria'],
          customFields: {
            'empresa': 'Consultoria XYZ',
            'setor': 'Serviços'
          }
        }
      ]
    },
    {
      id: 'qualification',
      name: 'Qualificação',
      order: 1,
      color: '#E5E7EB',
      deals: [
        {
          id: '3',
          title: 'Expansão Data Center',
          value: 300000,
          contactId: '1',
          stage: 'qualification',
          priority: 'high',
          status: 'active',
          createdAt: new Date('2024-02-15'),
          updatedAt: new Date('2024-03-08'),
          tags: ['Infraestrutura', 'Enterprise'],
          customFields: {
            'empresa': 'Tech Solutions',
            'setor': 'Tecnologia'
          },
          dueDate: new Date('2024-05-01')
        }
      ]
    },
    {
      id: 'proposal',
      name: 'Proposta',
      order: 2,
      color: '#E5E7EB',
      deals: [
        {
          id: '4',
          title: 'Migração Cloud',
          value: 250000,
          contactId: '2',
          stage: 'proposal',
          priority: 'medium',
          status: 'active',
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-03-05'),
          tags: ['Cloud', 'Migração'],
          customFields: {
            'empresa': 'Consultoria XYZ',
            'setor': 'Serviços'
          },
          dueDate: new Date('2024-04-30')
        }
      ]
    },
    {
      id: 'negotiation',
      name: 'Negociação',
      order: 3,
      color: '#E5E7EB',
      deals: []
    },
    {
      id: 'closed',
      name: 'Fechado',
      order: 4,
      color: '#E5E7EB',
      deals: []
    }
  ]
};

const initialPipelines: Pipeline[] = [
  initialPipeline,
  {
    id: '2',
    name: 'Suporte Técnico',
    type: 'support',
    color: '#10B981',
    stages: [
      {
        id: 'new',
        name: 'Novos Tickets',
        order: 0,
        color: '#E5E7EB',
        deals: [
          {
            id: '5',
            title: 'Erro de Integração API',
            value: 0,
            contactId: '1',
            stage: 'new',
            priority: 'high',
            status: 'active',
            createdAt: new Date('2024-03-10'),
            updatedAt: new Date('2024-03-10'),
            tags: ['API', 'Urgente'],
            customFields: {
              'sistema': 'ERP',
              'versao': '2.1.0'
            }
          }
        ]
      },
      {
        id: 'in-progress',
        name: 'Em Atendimento',
        order: 1,
        color: '#E5E7EB',
        deals: [
          {
            id: '6',
            title: 'Otimização de Performance',
            value: 0,
            contactId: '2',
            stage: 'in-progress',
            priority: 'medium',
            status: 'active',
            createdAt: new Date('2024-03-08'),
            updatedAt: new Date('2024-03-10'),
            tags: ['Performance'],
            customFields: {
              'sistema': 'Cloud',
              'ambiente': 'Produção'
            }
          }
        ]
      },
      {
        id: 'waiting',
        name: 'Aguardando Cliente',
        order: 2,
        color: '#E5E7EB',
        deals: []
      },
      {
        id: 'resolved',
        name: 'Resolvido',
        order: 3,
        color: '#E5E7EB',
        deals: []
      }
    ]
  },
  {
    id: '3',
    name: 'Vendas E-commerce',
    type: 'sales',
    color: '#8B5CF6',
    stages: [
      {
        id: 'lead',
        name: 'Leads',
        order: 0,
        color: '#E5E7EB',
        deals: [
          {
            id: '7',
            title: 'Loja Virtual Premium',
            value: 15000,
            contactId: '1',
            stage: 'lead',
            priority: 'medium',
            status: 'active',
            createdAt: new Date('2024-03-09'),
            updatedAt: new Date('2024-03-10'),
            tags: ['E-commerce', 'Premium'],
            customFields: {
              'plataforma': 'Custom',
              'segmento': 'Moda'
            }
          }
        ]
      },
      {
        id: 'contact',
        name: 'Primeiro Contato',
        order: 1,
        color: '#E5E7EB',
        deals: []
      },
      {
        id: 'demo',
        name: 'Demonstração',
        order: 2,
        color: '#E5E7EB',
        deals: []
      },
      {
        id: 'closing',
        name: 'Fechamento',
        order: 3,
        color: '#E5E7EB',
        deals: []
      }
    ]
  }
];

export function usePipeline() {
  const [pipelines, setPipelines] = useState<Pipeline[]>(initialPipelines);
  const [activePipelineId, setActivePipelineId] = useState<string>(initialPipelines[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Em produção, isso viria de uma configuração ou env var
  const service = mockPipelineService;

  const fetchPipelines = useCallback(async () => {
    try {
      setLoading(true);
      const data = await service.fetchPipelines();
      setPipelines(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar pipelines');
      console.error('Erro ao carregar pipelines:', err);
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Polling para manter dados sincronizados
  useEffect(() => {
    fetchPipelines();
    
    const pollInterval = setInterval(fetchPipelines, POLL_INTERVAL);
    
    return () => clearInterval(pollInterval);
  }, [fetchPipelines]);

  const activePipeline = pipelines.find(p => p.id === activePipelineId);

  const moveDeal = async (dealId: string, targetStageId: string) => {
    try {
      // Encontra o deal e seu estágio atual
      let dealToMove: Deal | undefined;
      let sourceStageId: string | undefined;

      for (const pipeline of pipelines) {
        for (const stage of pipeline.stages) {
          const deal = stage.deals.find(d => d.id === dealId);
          if (deal) {
            dealToMove = deal;
            sourceStageId = stage.id;
            break;
          }
        }
        if (dealToMove) break;
      }

      if (!dealToMove || !sourceStageId) return;

      // Atualiza estado local
      setPipelines(prev => {
        const newPipelines = [...prev];
        const pipelineIndex = newPipelines.findIndex(p => p.id === activePipelineId);
        
        if (pipelineIndex === -1) return prev;
        
        newPipelines[pipelineIndex] = {
          ...newPipelines[pipelineIndex],
          stages: newPipelines[pipelineIndex].stages.map(stage => {
            if (stage.id === targetStageId) {
              return {
                ...stage,
                deals: [...stage.deals, {
                  ...dealToMove!,
                  stage: targetStageId,
                  updatedAt: new Date()
                }]
              };
            }
            if (stage.id === sourceStageId) {
              return {
                ...stage,
                deals: stage.deals.filter(d => d.id !== dealId)
              };
            }
            return stage;
          })
        };
        return newPipelines;
      });

      // Atualiza no servidor em background
      await service.moveDeal(dealId, targetStageId);
    } catch (err) {
      setError('Erro ao mover oportunidade');
      console.error('Erro ao mover oportunidade:', err);
      // Recarrega dados apenas em caso de erro
      await fetchPipelines();
    }
  };

  const addDeal = async (dealData: Partial<Deal>) => {
    try {
      const newDeal = await service.addDeal(dealData);
      
      // Atualiza estado local otimisticamente
      setPipelines(prev => {
        const currentPipeline = prev.find(p => p.id === activePipelineId);
        if (!currentPipeline) return prev;

        const stageIndex = currentPipeline.stages.findIndex(s => s.id === newDeal.stage);
        if (stageIndex === -1) return prev;

        const newStages = [...currentPipeline.stages];
        newStages[stageIndex].deals.push(newDeal);

        return prev.map(p =>
          p.id === activePipelineId
            ? { ...p, stages: newStages }
            : p
        );
      });
      
      // Recarrega dados do servidor
      await fetchPipelines();
    } catch (err) {
      setError('Erro ao adicionar oportunidade');
      console.error('Erro ao adicionar oportunidade:', err);
    }
  };

  const updateDeal = (dealId: string, updates: Partial<Deal>) => {
    setPipelines(prev => {
      const currentPipeline = prev.find(p => p.id === activePipelineId);
      if (!currentPipeline) return prev;

      const newStages = currentPipeline.stages.map(stage => ({
        ...stage,
        deals: stage.deals.map(deal =>
          deal.id === dealId
            ? { ...deal, ...updates, updatedAt: new Date() }
            : deal
        )
      }));

      return prev.map(p =>
        p.id === activePipelineId
          ? { ...p, stages: newStages }
          : p
      );
    });
  };

  const deleteDeal = (dealId: string) => {
    setPipelines(prev => {
      const currentPipeline = prev.find(p => p.id === activePipelineId);
      if (!currentPipeline) return prev;

      const newStages = currentPipeline.stages.map(stage => ({
        ...stage,
        deals: stage.deals.filter(deal => deal.id !== dealId)
      }));

      return prev.map(p =>
        p.id === activePipelineId
          ? { ...p, stages: newStages }
          : p
      );
    });
  };

  const addStage = (pipelineId: string, stageName: string) => {
    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id === pipelineId) {
        const maxOrder = Math.max(...pipeline.stages.map(s => s.order));
        const newStage = {
          id: `stage-${uuidv4()}`,
          name: stageName,
          order: maxOrder + 1,
          color: '#E5E7EB',
          deals: []
        };
        return {
          ...pipeline,
          stages: [...pipeline.stages, newStage]
        };
      }
      return pipeline;
    }));
  };

  const updateStage = (pipelineId: string, stageId: string, updates: Partial<Stage>) => {
    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id === pipelineId) {
        return {
          ...pipeline,
          stages: pipeline.stages.map(stage =>
            stage.id === stageId ? { ...stage, ...updates } : stage
          )
        };
      }
      return pipeline;
    }));
  };

  const deleteStage = (pipelineId: string, stageId: string) => {
    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id === pipelineId) {
        return {
          ...pipeline,
          stages: pipeline.stages.filter(stage => stage.id !== stageId)
        };
      }
      return pipeline;
    }));
  };

  const reorderStages = (pipelineId: string, startIndex: number, endIndex: number) => {
    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id === pipelineId) {
        const newStages = Array.from(pipeline.stages);
        const [removed] = newStages.splice(startIndex, 1);
        newStages.splice(endIndex, 0, removed);
        
        return {
          ...pipeline,
          stages: newStages.map((stage, index) => ({
            ...stage,
            order: index
          }))
        };
      }
      return pipeline;
    }));
  };

  const addPipeline = (name: string, type: Pipeline['type'], parentId?: string) => {
    const newPipeline: Pipeline = {
      id: `pipeline-${uuidv4()}`,
      name,
      type,
      parentId,
      color: '#4F46E5',
      stages: type === 'sales' ? [
        { id: `stage-${uuidv4()}`, name: 'Prospecção', order: 0, color: '#E5E7EB', deals: [] },
        { id: `stage-${uuidv4()}`, name: 'Qualificação', order: 1, color: '#E5E7EB', deals: [] },
        { id: `stage-${uuidv4()}`, name: 'Proposta', order: 2, color: '#E5E7EB', deals: [] },
        { id: `stage-${uuidv4()}`, name: 'Negociação', order: 3, color: '#E5E7EB', deals: [] },
        { id: `stage-${uuidv4()}`, name: 'Fechado', order: 4, color: '#E5E7EB', deals: [] }
      ] : type === 'support' ? [
        { id: `stage-${uuidv4()}`, name: 'Novo', order: 0, color: '#E5E7EB', deals: [] },
        { id: `stage-${uuidv4()}`, name: 'Em Análise', order: 1, color: '#E5E7EB', deals: [] },
        { id: `stage-${uuidv4()}`, name: 'Em Atendimento', order: 2, color: '#E5E7EB', deals: [] },
        { id: `stage-${uuidv4()}`, name: 'Aguardando Cliente', order: 3, color: '#E5E7EB', deals: [] },
        { id: `stage-${uuidv4()}`, name: 'Resolvido', order: 4, color: '#E5E7EB', deals: [] }
      ] : [
        { id: `stage-${uuidv4()}`, name: 'Nova Fase', order: 0, color: '#E5E7EB', deals: [] }
      ]
    };

    setPipelines(prev => [...prev, newPipeline]);
    setActivePipelineId(newPipeline.id);
  };

  const updatePipeline = (pipelineId: string, updates: Partial<Pipeline>) => {
    setPipelines(prev =>
      prev.map(p =>
        p.id === pipelineId
          ? { ...p, ...updates }
          : p
      )
    );
  };

  const deletePipeline = (pipelineId: string) => {
    setPipelines(prev => prev.filter(p => p.id !== pipelineId));
    if (activePipelineId === pipelineId) {
      setActivePipelineId(prev[0].id);
    }
  };

  return {
    pipelines,
    activePipeline,
    setActivePipelineId,
    moveDeal,
    addDeal,
    updateDeal,
    deleteDeal,
    addStage,
    updateStage,
    deleteStage,
    reorderStages,
    addPipeline,
    updatePipeline,
    deletePipeline,
    loading,
    error
  };
}