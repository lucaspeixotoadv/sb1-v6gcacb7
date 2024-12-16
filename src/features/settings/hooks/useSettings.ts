import { useState } from 'react';
import { useSettingsActions } from './useSettingsActions';
import type { Settings, UseSettingsReturn } from '../types';

const initialSettings: Settings = {
  availableTags: ['Cliente', 'Prospect', 'VIP', 'Inativo'],
  customFieldDefinitions: [
    { key: 'empresa', label: 'Empresa', type: 'text' },
    { key: 'cargo', label: 'Cargo', type: 'text' },
    { key: 'valor_contrato', label: 'Valor do Contrato', type: 'currency' },
    { key: 'data_inicio', label: 'Data de Início', type: 'date' },
    { key: 'proxima_reuniao', label: 'Próxima Reunião', type: 'datetime' },
  ],
};

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const actions = useSettingsActions(settings, setSettings);

  return {
    ...settings,
    ...actions
  };
}