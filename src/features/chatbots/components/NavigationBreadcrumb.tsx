import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useChatbotStore } from '../store/chatbotStore';
import type { BreadcrumbItem } from '../types';

const CHANNEL_NAMES = {
  whatsapp: 'WhatsApp',
  messenger: 'Messenger',
  instagram: 'Instagram',
  telegram: 'Telegram'
};

export function NavigationBreadcrumb() {
  const { selectedChannel, selectedFolderId, folders } = useChatbotStore();

  const getBreadcrumbItems = React.useCallback((): BreadcrumbItem[] => {
    if (!selectedChannel) return [];

    const items: BreadcrumbItem[] = [
      { id: selectedChannel, name: CHANNEL_NAMES[selectedChannel], type: 'channel' }
    ];

    if (selectedFolderId) {
      const getFolderPath = (folderId: string): BreadcrumbItem[] => {
        const folder = folders[folderId];
        if (!folder) return [];

        const path = folder.parentId 
          ? [...getFolderPath(folder.parentId), { id: folder.id, name: folder.name, type: 'folder' }]
          : [{ id: folder.id, name: folder.name, type: 'folder' }];

        return path;
      };

      items.push(...getFolderPath(selectedFolderId));
    }

    return items;
  }, [selectedChannel, selectedFolderId, folders]);

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && <ChevronRight size={16} />}
          <span className={index === breadcrumbItems.length - 1 ? 'text-gray-900' : ''}>
            {item.name}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}