import React from 'react';
import { X, GripVertical, ChevronRight } from 'lucide-react';
import type { WebhookAction, WebhookActionType } from '../../../../features/automation/types';
import { useSettings } from '../../../../hooks/useSettings';
import { useWebhookStore } from '../../../../features/automation/store/webhookStore';

interface WebhookActionFormProps {
  action: WebhookAction;
  onUpdate: (action: WebhookAction) => void;
  onRemove: () => void;
  onSelectField: (actionId: string) => void;
  onMove?: (dragIndex: number, hoverIndex: number) => void;
  index: number;
}

const ACTION_LABELS: Record<WebhookActionType, string> = {
  addTag: 'Adicionar Etiqueta',
  removeTag: 'Remover Etiqueta',
  updateField: 'Atualizar Campo',
  addNote: 'Adicionar Nota',
  sendEmail: 'Enviar E-mail',
  createTask: 'Criar Tarefa'
};

export function WebhookActionForm({ action, onUpdate, onRemove, onSelectField, onMove, index }: WebhookActionFormProps) {
  const { settings } = useSettings();

  const renderActionFields = () => {
    switch (action.type) {
      case 'addTag':
      case 'removeTag':
        // Seleção múltipla de etiquetas
        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 mb-2">
              Selecione as etiquetas que deseja {action.type === 'addTag' ? 'adicionar' : 'remover'}
            </p>
            <div className="flex flex-wrap gap-2">
              {settings.availableTags.map(tag => (
                <label key={tag} className="inline-flex items-center bg-white px-3 py-2 rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(action.config.tags || []).includes(tag)}
                    onChange={(e) => {
                      const currentTags = action.config.tags || [];
                      const newTags = e.target.checked
                        ? [...currentTags, tag]
                        : currentTags.filter(t => t !== tag);
                      
                      onUpdate({
                        ...action,
                        config: { ...action.config, tags: newTags }
                      });
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{tag}</span>
                </label>
              ))}
            </div>
            {(action.config.tags || []).length > 0 && (
              <div className="text-sm text-gray-500">
                {(action.config.tags || []).length} etiqueta(s) selecionada(s)
              </div>
            )}
          </div>
        );

      case 'updateField':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Campo a ser atualizado</label>
              <select
                value={action.config.field || ''}
                onChange={(e) => onUpdate({
                  ...action,
                  config: { ...action.config, field: e.target.value }
                })}
                className="flex-1 px-3 py-2 border rounded-lg"
              >
                <option value="">Selecione um campo...</option>
                {settings.customFieldDefinitions.map(field => (
                  <option key={field.key} value={field.key}>{field.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Valor do campo</label>
              <button
                type="button"
                onClick={() => onSelectField(action.id)}
                className="w-full px-3 py-2 text-left border rounded-lg hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="text-gray-600">
                  {action.config.value || 'Clique para selecionar o valor'}
                </span>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
        );

      case 'addNote':
        return (
          <textarea
            value={action.config.note || ''}
            onChange={(e) => onUpdate({
              ...action,
              config: { ...action.config, note: e.target.value }
            })}
            placeholder="Conteúdo da nota..."
            rows={3}
            className="w-full px-3 py-2 border rounded-lg"
          />
        );

      case 'sendEmail':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={action.config.email?.subject || ''}
              onChange={(e) => onUpdate({
                ...action,
                config: {
                  ...action.config,
                  email: {
                    ...action.config.email,
                    subject: e.target.value
                  }
                }
              })}
              placeholder="Assunto"
              className="w-full px-3 py-2 border rounded-lg"
            />
            <textarea
              value={action.config.email?.body || ''}
              onChange={(e) => onUpdate({
                ...action,
                config: {
                  ...action.config,
                  email: {
                    ...action.config.email,
                    body: e.target.value
                  }
                }
              })}
              placeholder="Conteúdo do e-mail..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        );

      case 'createTask':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={action.config.task?.title || ''}
              onChange={(e) => onUpdate({
                ...action,
                config: {
                  ...action.config,
                  task: {
                    ...action.config.task,
                    title: e.target.value
                  }
                }
              })}
              placeholder="Título da tarefa"
              className="w-full px-3 py-2 border rounded-lg"
            />
            <textarea
              value={action.config.task?.description || ''}
              onChange={(e) => onUpdate({
                ...action,
                config: {
                  ...action.config,
                  task: {
                    ...action.config.task,
                    description: e.target.value
                  }
                }
              })}
              placeholder="Descrição da tarefa..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="date"
              value={action.config.task?.dueDate || ''}
              onChange={(e) => onUpdate({
                ...action,
                config: {
                  ...action.config,
                  task: {
                    ...action.config.task,
                    dueDate: e.target.value
                  }
                }
              })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button className="cursor-move text-gray-400 hover:text-gray-600">
            <GripVertical size={20} />
          </button>
          <span className="font-medium">{ACTION_LABELS[action.type]}</span>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>
      
      {renderActionFields()}
    </div>
  );
}