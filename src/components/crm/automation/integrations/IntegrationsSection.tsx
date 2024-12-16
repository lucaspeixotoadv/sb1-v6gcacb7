import React, { useState } from 'react';
import { WebhooksManager } from './WebhooksManager';
import { Webhook, Boxes } from 'lucide-react';
import type { WebhookConfig } from '../../../../features/automation/types';

const SECTIONS = [
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  { id: 'apps', label: 'Aplicações', icon: Boxes, disabled: true }
] as const;

type SectionId = typeof SECTIONS[number]['id'];

interface IntegrationsSectionProps {
  onConfigureWebhook: (webhookId: string) => void;
}

export function IntegrationsSection({ onConfigureWebhook }: IntegrationsSectionProps) {
  const [activeSection, setActiveSection] = useState<SectionId>('webhooks');

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex space-x-4 mb-6">
        {SECTIONS.map(({ id, label, icon: Icon, disabled }) => (
          <button
            key={id}
            onClick={() => !disabled && setActiveSection(id)}
            className={`
              flex items-center px-4 py-2 rounded-lg
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${activeSection === id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'}
            `}
          >
            <Icon size={18} className="mr-2" />
            {label}
            {disabled && (
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                Em breve
              </span>
            )}
          </button>
        ))}
      </div>

      {activeSection === 'webhooks' && (
        <WebhooksManager onConfigureWebhook={onConfigureWebhook} />
      )}
    </div>
  );
}