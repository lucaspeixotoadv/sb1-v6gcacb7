import React, { useState } from 'react';
import { WebhooksManager } from './integrations/WebhooksManager';
import { Webhook, Boxes } from 'lucide-react';
import type { WebhookConfig } from '../../../../features/automation/types';

// Tipagem para as seções
type Section = {
  id: 'webhooks' | 'apps';
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  disabled?: boolean;
};

// Definição das seções com tipagem adequada
const SECTIONS: readonly Section[] = [
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
      <div className="flex space-x-2 mb-6">
        {SECTIONS.map(({ id, label, icon: Icon, disabled }) => (
          <button
            key={id}
            onClick={() => !disabled && setActiveSection(id)}
            disabled={disabled}
            className={`
              flex items-center px-4 py-2 rounded-lg transition-colors
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${activeSection === id
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'}
            `}
          >
            <Icon size={18} className="mr-2" />
            {label}
            {disabled && (
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
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

export default IntegrationsSection;