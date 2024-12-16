import React, { useState } from 'react';
import { SettingsMenu } from './settings/SettingsMenu';
import { TagsManager } from './settings/TagsManager';
import { CustomFieldsManager } from './settings/CustomFieldsManager';
import { TeamManager } from './settings/team/TeamManager';
import { ConnectionManager } from './settings/connection';
import { useSettings } from '../../hooks/useSettings';

export function SettingsArea() {
  const [activeSection, setActiveSection] = useState('conexao');
  const { settings } = useSettings();

  return (
    <div className="flex-1 p-6 bg-white">
      <h2 className="text-2xl font-semibold mb-6">Configurações</h2>
      
      <SettingsMenu
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      {activeSection === 'conexao' && (
        <ConnectionManager />
      )}

      {activeSection === 'campos' && <CustomFieldsManager settings={settings} />}
      {activeSection === 'etiquetas' && <TagsManager settings={settings} />}

      {activeSection === 'equipe' && (
        <TeamManager />
      )}

      {activeSection === 'horarios' && (
        <div>
          <h3 className="text-lg font-medium mb-4">Horários de Atendimento</h3>
          {/* Conteúdo da seção de horários */}
        </div>
      )}

      {activeSection === 'fluxos' && (
        <div>
          <h3 className="text-lg font-medium mb-4">Fluxos Padrões</h3>
          {/* Conteúdo da seção de fluxos */}
        </div>
      )}

    </div>
  );
}