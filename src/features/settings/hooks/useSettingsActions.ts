import { useCallback } from 'react';
import type { Settings, CustomFieldDefinition, SettingsActions } from '../types';

export function useSettingsActions(
  settings: Settings,
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
): SettingsActions {
  const addTag = useCallback((tag: string) => {
    setSettings(prev => ({
      ...prev,
      availableTags: [...prev.availableTags, tag],
    }));
  }, [setSettings]);

  const removeTag = useCallback((tag: string) => {
    setSettings(prev => ({
      ...prev,
      availableTags: prev.availableTags.filter(t => t !== tag),
    }));
  }, [setSettings]);

  const addCustomField = useCallback((field: CustomFieldDefinition) => {
    setSettings(prev => ({
      ...prev,
      customFieldDefinitions: [...prev.customFieldDefinitions, field],
    }));
  }, [setSettings]);

  const removeCustomField = useCallback((key: string) => {
    setSettings(prev => ({
      ...prev,
      customFieldDefinitions: prev.customFieldDefinitions.filter(f => f.key !== key),
    }));
  }, [setSettings]);

  const updateCustomField = useCallback((key: string, updates: Partial<CustomFieldDefinition>) => {
    setSettings(prev => ({
      ...prev,
      customFieldDefinitions: prev.customFieldDefinitions.map(field =>
        field.key === key ? { ...field, ...updates } : field
      ),
    }));
  }, [setSettings]);

  return {
    addTag,
    removeTag,
    addCustomField,
    removeCustomField,
    updateCustomField
  };
}