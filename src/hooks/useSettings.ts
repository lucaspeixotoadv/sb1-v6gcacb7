import { useState, useEffect, useCallback } from 'react';
import type { Settings, CustomFieldDefinition, Folder, CompanySettings } from '../features/settings/types';
import { v4 as uuidv4 } from 'uuid';

const initialSettings: Settings = {
  availableTags: ['Cliente', 'Prospect', 'VIP', 'Inativo'],
  customFieldDefinitions: [
    { key: 'empresa', label: 'Empresa', type: 'text' },
    { key: 'cargo', label: 'Cargo', type: 'text' },
    { key: 'valor_contrato', label: 'Valor do Contrato', type: 'currency' },
    { key: 'data_inicio', label: 'Data de Início', type: 'date' },
    { key: 'proxima_reuniao', label: 'Próxima Reunião', type: 'datetime' },
  ],
  company: {
    name: 'Minha Empresa'
  },
  folders: {
    fields: [
      { id: 'f1', name: 'Dados da Empresa', items: ['empresa', 'cargo'] },
      { id: 'f2', name: 'Financeiro', items: ['valor_contrato'] },
      { id: 'f3', name: 'Datas', items: ['data_inicio', 'proxima_reuniao'] }
    ],
    tags: [
      { id: 't1', name: 'Status do Cliente', items: ['Cliente', 'Prospect'] },
      { id: 't2', name: 'Classificação', items: ['VIP', 'Inativo'] }
    ]
  }
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const savedSettings = localStorage.getItem('app_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        return {
          ...initialSettings,
          ...parsed,
          company: {
            ...initialSettings.company,
            ...parsed.company,
            logo: parsed.company?.logo || undefined
          }
        };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return initialSettings;
  });

  const saveSettings = useCallback((newSettings: Settings) => {
    try {
      localStorage.setItem('app_settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, []);

  useEffect(() => {
    saveSettings(settings);
  }, [settings, saveSettings]);

  const addFolder = (type: 'fields' | 'tags', name: string, parentId?: string) => {
    const newFolder: Folder = {
      id: uuidv4(),
      name,
      parentId,
      items: []
    };

    setSettings(prev => ({
      ...prev,
      folders: {
        ...prev.folders,
        [type]: [...prev.folders[type], newFolder]
      }
    }));
  };

  const removeFolder = (type: 'fields' | 'tags', folderId: string) => {
    setSettings(prev => ({
      ...prev,
      folders: {
        ...prev.folders,
        [type]: prev.folders[type].filter(f => f.id !== folderId)
      }
    }));
  };

  const moveItemToFolder = (type: 'fields' | 'tags', itemId: string, folderId?: string) => {
    setSettings(prev => {
      const newFolders = prev.folders[type].map(folder => ({
        ...folder,
        items: folder.items.filter(id => id !== itemId)
      }));

      if (folderId) {
        const targetFolder = newFolders.find(f => f.id === folderId);
        if (targetFolder) {
          targetFolder.items.push(itemId);
        }
      }

      return {
        ...prev,
        folders: {
          ...prev.folders,
          [type]: newFolders
        }
      };
    });
  };

  const addTag = (tag: string) => {
    setSettings(prev => ({
      ...prev,
      availableTags: [...prev.availableTags, tag],
    }));
  };

  const removeTag = (tag: string) => {
    setSettings(prev => ({
      ...prev,
      availableTags: prev.availableTags.filter(t => t !== tag),
    }));
  };

  const addCustomField = (field: CustomFieldDefinition) => {
    setSettings(prev => ({
      ...prev,
      customFieldDefinitions: [...prev.customFieldDefinitions, field],
    }));
  };

  const removeCustomField = (key: string) => {
    setSettings(prev => ({
      ...prev,
      customFieldDefinitions: prev.customFieldDefinitions.filter(f => f.key !== key),
    }));
  };

  const updateCustomField = (key: string, updates: Partial<CustomFieldDefinition>) => {
    setSettings(prev => ({
      ...prev,
      customFieldDefinitions: prev.customFieldDefinitions.map(field =>
        field.key === key ? { ...field, ...updates } : field
      ),
    }));
  };

  const updateCompanySettings = (companySettings: CompanySettings) => {
    setSettings(prev => ({
      ...prev,
      company: {
        ...prev.company,
        ...companySettings
      }
    }));
  };

  return {
    settings,
    addTag,
    removeTag,
    addFolder,
    removeFolder,
    moveItemToFolder,
    addCustomField,
    removeCustomField,
    updateCustomField,
    updateCompanySettings
  };
}