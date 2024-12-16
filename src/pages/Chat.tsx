import React from 'react';
import { ContactList } from '../components/chat/ContactList';
import { ChatWindow } from '../components/chat/ChatWindow';
import { ContactDetails } from '../components/chat/ContactDetails';
import { useMessaging } from '../contexts/MessagingContext';
import { useContacts } from '../hooks/useContacts';
import { useSettings } from '../hooks/useSettings';
import type { Contact, Message } from '../types';

export function Chat() {
  const { 
    status, 
    qrCode, 
    connect, 
    initialize, 
    sendMessage, 
    messages, 
    getContactMessages 
  } = useMessaging();
  
  const { contacts } = useContacts();
  const { settings } = useSettings();
  const [selectedContact, setSelectedContact] = React.useState<Contact | undefined>();

  // Inicializa o ZAPI quando houver configurações válidas
  React.useEffect(() => {
    if (settings.zapi?.instanceId && settings.zapi?.token && settings.zapi?.clientToken) {
      initialize({
        instanceId: settings.zapi.instanceId,
        token: settings.zapi.token,
        clientToken: settings.zapi.clientToken,
        baseUrl: 'https://api.z-api.io' // URL base da API
      });
    }
  }, [initialize, settings.zapi]);

  // Conecta automaticamente se tiver configurações e não estiver conectado
  React.useEffect(() => {
    if (settings.zapi && status?.session === 'disconnected') {
      connect();
    }
  }, [status, connect, settings.zapi]);

  const contactMessages = React.useMemo(() => {
    if (!selectedContact) return [];
    return getContactMessages(selectedContact.id);
  }, [selectedContact, getContactMessages]);

  const handleSendMessage = async (content: string, type: Message['type'] = 'text') => {
    if (!selectedContact) return;

    try {
      await sendMessage({
        phone: selectedContact.phone,
        message: content,
        type
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // TODO: Adicionar toast/notificação de erro
    }
  };

  // Mostra mensagem se não houver configuração
  if (!settings.zapi?.instanceId || !settings.zapi?.token || !settings.zapi?.clientToken) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">WhatsApp não configurado</h2>
          <p className="mb-4">Configure suas credenciais do Z-API nas configurações</p>
          {/* TODO: Adicionar link para página de configurações */}
          <a 
            href="/settings"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Ir para Configurações
          </a>
        </div>
      </div>
    );
  }

  // Renderiza QR Code se necessário
  if (status?.session === 'connecting' && qrCode) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Conecte seu WhatsApp</h2>
          <p className="mb-4">Escaneie o QR Code com seu WhatsApp</p>
          <img 
            src={qrCode} 
            alt="WhatsApp QR Code" 
            className="mx-auto max-w-xs"
          />
        </div>
      </div>
    );
  }

  // Renderiza mensagem se desconectado
  if (status?.session === 'disconnected') {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">WhatsApp Desconectado</h2>
          <p className="mb-4">Clique para conectar</p>
          <button
            onClick={() => connect()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Conectar WhatsApp
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] grid grid-cols-[320px,1fr,320px]">
      <ContactList
        contacts={contacts}
        selectedContactId={selectedContact?.id}
        onSelectContact={setSelectedContact}
      />
      <ChatWindow
        contact={selectedContact}
        messages={contactMessages}
        onSendMessage={handleSendMessage}
        connectionStatus={status?.session}
      />
      {selectedContact && <ContactDetails contact={selectedContact} />}
    </div>
  );
}