import React from 'react';
import { Save } from 'lucide-react';
import type { QueueSettings, AssignmentStrategy } from '../../types/chat';

interface QueueSettingsProps {
  settings: QueueSettings;
  onSave: (settings: QueueSettings) => void;
}

const STRATEGIES: { value: AssignmentStrategy['type']; label: string }[] = [
  { value: 'round-robin', label: 'Distribuição Circular' },
  { value: 'least-busy', label: 'Menos Ocupado' },
  { value: 'random', label: 'Aleatório' }
];

export function QueueSettings({ settings, onSave }: QueueSettingsProps) {
  const [formData, setFormData] = React.useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Configurações da Fila</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tamanho Máximo da Fila
            </label>
            <input
              type="number"
              min="1"
              value={formData.maxSize}
              onChange={e => setFormData(prev => ({
                ...prev,
                maxSize: parseInt(e.target.value)
              }))}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estratégia de Distribuição
            </label>
            <select
              value={formData.assignmentStrategy.type}
              onChange={e => setFormData(prev => ({
                ...prev,
                assignmentStrategy: {
                  type: e.target.value as AssignmentStrategy['type'],
                  config: {
                    maxChatsPerAgent: 5,
                    considerAgentLoad: true
                  }
                }
              }))}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {STRATEGIES.map(strategy => (
                <option key={strategy.value} value={strategy.value}>
                  {strategy.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="auto-assignment"
              checked={formData.autoAssignmentEnabled}
              onChange={e => setFormData(prev => ({
                ...prev,
                autoAssignmentEnabled: e.target.checked
              }))}
              className="rounded border-gray-300"
            />
            <label htmlFor="auto-assignment" className="text-sm text-gray-700">
              Ativar distribuição automática
            </label>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <button
          type="submit"
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 flex items-center gap-2"
        >
          <Save size={20} />
          Salvar Configurações
        </button>
      </div>
    </form>
  );
}