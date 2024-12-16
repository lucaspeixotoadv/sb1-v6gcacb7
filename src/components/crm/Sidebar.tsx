import React from 'react';
import { MessageSquare, Settings, Users, BarChart3, Zap, Building, PieChart } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { CompanySettingsModal } from './settings/CompanySettingsModal';

interface SidebarProps {
  activeTab: 'chat' | 'settings' | 'contacts' | 'pipeline' | 'automation' | 'metrics';
  onTabChange: (tab: 'chat' | 'settings' | 'contacts' | 'pipeline' | 'automation' | 'metrics') => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { settings } = useSettings();
  const companyLogo = settings.company?.logo;
  const companyName = settings.company?.name;
  const [showCompanySettings, setShowCompanySettings] = React.useState(false);

  return (
    <div 
      className="w-20 flex flex-col items-center py-4 bg-black fixed top-0 left-0 h-full z-[10]"
    >
      {/* Company Logo */}
      <button 
        onClick={() => setShowCompanySettings(true)}
        className="relative w-12 h-12 rounded-full flex items-center justify-center mb-4 overflow-hidden hover:ring-2 hover:ring-gray-700 transition-all bg-gray-800"
        title="Configurações da Empresa"
      >
        {companyLogo ? (
          <img 
            src={companyLogo} 
            alt={companyName || 'Company Logo'} 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <Building className="w-6 h-6 text-gray-400" />
        )}
      </button>
      
      {/* Navigation */}
      <button 
        className={`p-3 rounded-lg mb-2 ${
          activeTab === 'contacts' 
            ? 'bg-white text-black' 
            : 'text-gray-400 hover:bg-gray-800'
        }`}
        onClick={() => onTabChange('contacts')}
      >
        <Users size={24} />
      </button>
      <button 
        className={`p-3 rounded-lg mb-2 ${
          activeTab === 'pipeline' 
            ? 'bg-white text-black' 
            : 'text-gray-400 hover:bg-gray-800'
        }`}
        onClick={() => onTabChange('pipeline')}
      >
        <BarChart3 size={24} />
      </button>
      <button 
        className={`p-3 rounded-lg mb-2 ${
          activeTab === 'chat' 
            ? 'bg-white text-black' 
            : 'text-gray-400 hover:bg-gray-800'
        }`}
        onClick={() => onTabChange('chat')}
      >
        <MessageSquare size={24} />
      </button>
      <button 
        className={`p-3 rounded-lg mb-2 ${
          activeTab === 'automation' 
            ? 'bg-white text-black' 
            : 'text-gray-400 hover:bg-gray-800'
        }`}
        onClick={() => onTabChange('automation')}
      >
        <Zap size={24} />
      </button>
      <button 
        className={`p-3 rounded-lg mb-2 ${
          activeTab === 'metrics' 
            ? 'bg-white text-black' 
            : 'text-gray-400 hover:bg-gray-800'
        }`}
        onClick={() => onTabChange('metrics')}
      >
        <PieChart size={24} />
      </button>
      <button 
        className={`p-3 rounded-lg ${
          activeTab === 'settings' 
            ? 'bg-white text-black' 
            : 'text-gray-400 hover:bg-gray-800'
        }`}
        onClick={() => onTabChange('settings')}
      >
        <Settings size={24} />
      </button>
      
      {showCompanySettings && (
        <CompanySettingsModal
          isOpen={showCompanySettings}
          onClose={() => setShowCompanySettings(false)}
        />
      )}
    </div>
  );
}