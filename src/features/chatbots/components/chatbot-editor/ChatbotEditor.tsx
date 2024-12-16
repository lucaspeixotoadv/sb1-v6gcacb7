import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, Save, Loader } from 'lucide-react';
import { useChatbotStore } from '../../store/chatbotStore';
import { Button } from '@/components/ui/Button';
import { FlowEditor } from '../flow/FlowEditor';
import type { FlowConfig } from '../../types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ChatbotEditorProps {
  chatbotId: string;
  onBack: () => void;
}

export function ChatbotEditor({ chatbotId, onBack }: ChatbotEditorProps) {
  const { chatbots, updateChatbot } = useChatbotStore();
  const chatbot = chatbots[chatbotId];
  
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConfig, setCurrentConfig] = useState<FlowConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(chatbot.name);

  useEffect(() => {
    const defaultConfig: FlowConfig = {
      nodes: [
        {
          id: 'start',
          type: 'start',
          position: { x: 100, y: 100 },
          data: { label: 'Início' }
        }
      ],
      edges: []
    };
    setCurrentConfig(chatbot?.config?.flow || defaultConfig);
  }, [chatbot]);

  const handleConfigChange = useCallback((newConfig: FlowConfig) => {
    setCurrentConfig(newConfig);
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = async () => {
    if (!currentConfig) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      await updateChatbot(chatbotId, {
        config: {
          ...chatbot.config,
          flow: currentConfig
        }
      });
      
      setHasUnsavedChanges(false);
    } catch (err) {
      setError('Erro ao salvar as alterações. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmExit = window.confirm(
        'Existem alterações não salvas. Deseja realmente sair?'
      );
      if (!confirmExit) return;
    }
    onBack();
  }, [hasUnsavedChanges, onBack]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editedName.trim() && editedName !== chatbot.name) {
      updateChatbot(chatbotId, { name: editedName.trim() });
      setIsEditing(false);
    }
  };

  if (!chatbot) return null;

  return (
    <div className="fixed inset-0 left-[60px] bg-gray-50 z-20 flex flex-col overflow-hidden">
      <div className="h-14 bg-white border-b flex items-center justify-between px-4 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 flex items-center gap-2"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <form onSubmit={handleNameSubmit} onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={editedName}
                  onChange={e => setEditedName(e.target.value)}
                  className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onBlur={handleNameSubmit}
                  onKeyDown={e => {
                    if (e.key === 'Escape') {
                      setIsEditing(false);
                      setEditedName(chatbot.name);
                    }
                  }}
                />
              </form>
            ) : (
              <h2 
                className="text-sm font-medium cursor-text" 
                onClick={() => {
                  setIsEditing(true);
                  setEditedName(chatbot.name);
                }}
              >
                {chatbot.name}
              </h2>
            )}
          </div>
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-600">
              (Alterações não salvas)
            </span>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving || !hasUnsavedChanges}
          variant="primary"
          size="sm"
          title="Salvar Alterações"
        >
          {isSaving ? (
            <Loader size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex-1 min-h-0">
        <FlowEditor
          initialConfig={currentConfig || chatbot.config.flow}
          onChange={handleConfigChange}
          onSave={handleSave}
        />
      </div>
    </div> 
  );
}