export interface CustomFieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'datetime';
  options?: string[];
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  items: string[];
}

export interface CompanySettings {
  name: string;
  logo?: string;
}

export interface Settings {
  availableTags: string[];
  customFieldDefinitions: CustomFieldDefinition[];
  company: CompanySettings;
  folders: {
    fields: Folder[];
    tags: Folder[];
  };
}

export interface SettingsActions {
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  addFolder: (type: 'fields' | 'tags', name: string, parentId?: string) => void;
  removeFolder: (type: 'fields' | 'tags', folderId: string) => void;
  moveItemToFolder: (type: 'fields' | 'tags', itemId: string, folderId?: string) => void;
  addCustomField: (field: CustomFieldDefinition) => void;
  removeCustomField: (key: string) => void;
  updateCustomField: (key: string, updates: Partial<CustomFieldDefinition>) => void;
}

export interface UseSettingsReturn extends Settings, SettingsActions {}