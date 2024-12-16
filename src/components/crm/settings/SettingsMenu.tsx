import React from 'react';
import { Link2, Database, Tag, MessageSquare, Users, Clock, GitBranch } from 'lucide-react';

interface SettingsMenuProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: 'conexao', label: 'Conexão', icon: Link2 },
  { id: 'campos', label: 'Campos', icon: Database },
  { id: 'etiquetas', label: 'Etiquetas', icon: Tag },
  { id: 'equipe', label: 'Equipe', icon: Users },
  { id: 'horarios', label: 'Horários', icon: Clock },
  { id: 'fluxos', label: 'Fluxos Padrões', icon: GitBranch }
];

export function SettingsMenu({ activeSection, onSectionChange }: SettingsMenuProps) {
  return (
    <div className="border-b mb-6">
      <div className="flex space-x-1 overflow-x-auto pb-2">
        {menuItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSectionChange(id)}
            className={`
              flex items-center px-4 py-2 rounded-lg whitespace-nowrap
              ${activeSection === id
                ? 'bg-black text-white'
                : 'bg-white text-gray-900 hover:bg-gray-100'}
            `}
          >
            <Icon size={18} className="mr-2" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
