import React from 'react';
import { Sidebar } from '../components/crm/Sidebar';
import { ChatArea } from '../components/crm/ChatArea';
import { SettingsArea } from '../components/crm/SettingsArea';
import { ContactsArea } from '../components/crm/ContactsArea';
import { AutomationArea } from '../components/crm/AutomationArea';
import { MetricsArea } from '../components/crm/MetricsArea';
import { PipelineRoot } from '../features/pipeline/components/PipelineRoot';
import { ContactsProvider } from '../contexts/ContactsContext';
import { MessagingProvider } from '../contexts/MessagingContext';
import { PipelineProvider } from '../features/pipeline/context/PipelineContext';
import { UserProvider } from '../contexts/UserContext';
import { TeamProvider } from '../contexts/TeamContext';

export function CRMPreview() {
  const [activeTab, setActiveTab] = React.useState<'chat' | 'settings' | 'contacts' | 'pipeline' | 'automation' | 'metrics'>('chat');

  return (
    <UserProvider>
      <TeamProvider>
        <ContactsProvider>
          <MessagingProvider>
            <PipelineProvider>
              <div className="flex h-screen bg-gray-100">
                <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
                <div className="flex-1 pl-20"> {/* Adicionado pl-20 para compensar o width do sidebar */}
                  {activeTab === 'chat' && <ChatArea />}
                  {activeTab === 'settings' && <SettingsArea />}
                  {activeTab === 'contacts' && <ContactsArea />}
                  {activeTab === 'pipeline' && <PipelineRoot />}
                  {activeTab === 'automation' && <AutomationArea />}
                  {activeTab === 'metrics' && <MetricsArea />}
                </div>
              </div>
            </PipelineProvider>
          </MessagingProvider>
        </ContactsProvider>
      </TeamProvider>
    </UserProvider>
  );
}