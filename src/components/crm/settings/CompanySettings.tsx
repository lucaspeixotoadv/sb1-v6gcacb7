import React, { useState, useRef } from 'react';
import { Upload, Save, X } from 'lucide-react';
import { useSettings } from '../../../hooks/useSettings';
import { Button } from '@/components/ui/Button';
import type { CompanySettings as CompanySettingsType } from '../../../features/settings/types';

interface CompanySettingsProps {
  onSave?: () => void;
}

export function CompanySettings({ onSave }: CompanySettingsProps) {
  const { settings, updateCompanySettings } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettingsType>(
    settings.company || {
      name: '',
    }
  );
  const [previewLogo, setPreviewLogo] = useState<string | undefined>(settings.company?.logo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setSaveMessage({ 
          type: 'error', 
          text: 'A imagem deve ter no máximo 2MB' 
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSaveMessage({ 
          type: 'error', 
          text: 'O arquivo deve ser uma imagem' 
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewLogo(base64String);
        setCompanySettings(prev => ({
          ...prev,
          logo: base64String
        }));
        setSaveMessage(null);
      };
      reader.onerror = () => {
        setSaveMessage({ 
          type: 'error', 
          text: 'Erro ao carregar a imagem' 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    if (!companySettings.name.trim()) {
      setSaveMessage({ type: 'error', text: 'O nome da empresa é obrigatório' });
      setIsSaving(false);
      return;
    }
    
    try {
      await updateCompanySettings(companySettings);
      setSaveMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      onSave?.();
    } catch (error) {
      console.error('Error saving company settings:', error);
      setSaveMessage({ type: 'error', text: 'Erro ao salvar configurações. Tente novamente.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveLogo = () => {
    setPreviewLogo(undefined);
    setCompanySettings(prev => ({
      ...prev,
      logo: undefined
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-6">Configurações da Empresa</h3>
        
        <div className="grid grid-cols-1 gap-8">
          {/* Logo Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Logo da Empresa
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {previewLogo ? (
                    <img 
                      src={previewLogo} 
                      alt="Company Logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                {previewLogo && (
                  <button
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <X size={16} className="text-gray-500" />
                  </button>
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Alterar Logo
                </Button>
                <p className="mt-2 text-sm text-gray-500">
                  Recomendado: 512x512px, PNG ou JPG
                </p>
              </div>
            </div>
          </div>

          {/* Nome da Empresa */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Empresa
              </label>
              <input
                type="text"
                value={companySettings.name}
                onChange={(e) => setCompanySettings(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Nome da sua empresa"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        {saveMessage && (
          <div className={`mr-4 px-4 py-2 rounded-lg ${
            saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {saveMessage.text}
          </div>
        )}
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-black text-white hover:bg-gray-900"
        >
          <Save size={20} />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
}