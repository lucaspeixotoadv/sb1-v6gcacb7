import React, { Suspense, useState } from 'react';
import { ListOrdered, Webhook, Bot } from 'lucide-react';
import { SequencesSection } from './SequencesSection';
import { IntegrationsSection } from './IntegrationsSection'; 
import { WebhookConfigScreen } from './integrations/WebhookConfigScreen';

const ENABLE_CHATBOTS = true;

// Lazy load do ChatbotsSection
const ChatbotsSection = React.lazy(() => import('./ChatbotsSection'));

// Tipagem para as seções
type Section = {
  id: 'sequences' | 'integrations' | 'chatbots';
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

// Definição das seções com tipagem adequada
const SECTIONS: readonly Section[] = [
  { id: 'sequences', label: 'Sequências', icon: ListOrdered },
  { id: 'integrations', label: 'Integrações', icon: Webhook }
];

// Adiciona chatbots apenas se habilitado
const ALL_SECTIONS = ENABLE_CHATBOTS
  ? [{ id: 'chatbots', label: 'Chatbots', icon: Bot } as const, ...SECTIONS]
  : SECTIONS;

type SectionId = typeof ALL_SECTIONS[number]['id'];

export function AutomationArea() {
  const [activeSection, setActiveSection] = useState<SectionId>('sequences');
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);

  if (selectedWebhookId) {
    return (
      <WebhookConfigScreen
        webhookId={selectedWebhookId}
        onBack={() => setSelectedWebhookId(null)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-6 bg-white border-b">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">Automação</h2>
        
        <div className="flex space-x-2 overflow-x-auto">
          {ALL_SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`
                flex items-center px-4 py-2 rounded-lg whitespace-nowrap transition-colors
                ${activeSection === id
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100'}
              `}
            >
              <Icon size={18} className="mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {activeSection === 'sequences' && <SequencesSection />}
        {activeSection === 'integrations' && (
          <IntegrationsSection onConfigureWebhook={setSelectedWebhookId} />
        )}
        {ENABLE_CHATBOTS && activeSection === 'chatbots' && (
          <Suspense fallback={<div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Carregando chatbots...</p>
          </div>}>
            <ChatbotsSection />
          </Suspense>
        )}
      </div>
    </div>
  );
}

export default AutomationArea;