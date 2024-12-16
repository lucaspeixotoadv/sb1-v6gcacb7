import React from 'react';
import { Copy, ChevronRight, ChevronDown } from 'lucide-react';

interface WebhookRequest {
  id: string;
  timestamp: Date;
  method: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: any;
}

interface WebhookRequestViewerProps {
  request: WebhookRequest;
  onClose: () => void;
}

function JsonView({ data }: { data: any }) {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  const toggleExpand = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderValue = (value: any, path: string = '') => {
    if (value === null) return <span className="text-gray-500">null</span>;
    if (typeof value === 'boolean') return <span className="text-purple-600">{value.toString()}</span>;
    if (typeof value === 'number') return <span className="text-blue-600">{value}</span>;
    if (typeof value === 'string') return <span className="text-green-600">"{value}"</span>;
    
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-500">[]</span>;
      
      return (
        <div className="ml-4">
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => toggleExpand(path)}
          >
            {expanded[path] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className="text-gray-500">Array[{value.length}]</span>
          </div>
          {expanded[path] && (
            <div className="ml-4">
              {value.map((item: any, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-gray-400">{index}:</span>
                  {renderValue(item, `${path}.${index}`)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) return <span className="text-gray-500">{}</span>;
      
      return (
        <div className="ml-4">
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => toggleExpand(path)}
          >
            {expanded[path] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className="text-gray-500">Object</span>
          </div>
          {expanded[path] && (
            <div className="ml-4">
              {entries.map(([key, val]) => (
                <div key={key} className="flex items-start gap-2">
                  <span className="text-gray-400">{key}:</span>
                  {renderValue(val, `${path}.${key}`)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    return <span className="text-gray-500">{String(value)}</span>;
  };

  return <div className="font-mono text-sm">{renderValue(data, 'root')}</div>;
}

export function WebhookRequestViewer({ request, onClose }: WebhookRequestViewerProps) {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
      alert('Copiado para a área de transferência!');
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-lg font-medium">Detalhes da Requisição</h3>
            <p className="text-sm text-gray-500">
              Recebido em {request.timestamp.toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Método e Headers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900">Headers</h4>
              <button
                onClick={() => copyToClipboard(request.headers)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                <Copy size={16} className="inline mr-1" />
                Copiar
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
              <JsonView data={request.headers} />
            </div>
          </div>

          {/* Query Parameters */}
          {Object.keys(request.query).length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">Query Parameters</h4>
                <button
                  onClick={() => copyToClipboard(request.query)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  <Copy size={16} className="inline mr-1" />
                  Copiar
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                <JsonView data={request.query} />
              </div>
            </div>
          )}

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900">Body</h4>
              <button
                onClick={() => copyToClipboard(request.body)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                <Copy size={16} className="inline mr-1" />
                Copiar
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
              <JsonView data={request.body} />
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-500">
            Use estes dados para mapear os campos corretamente na configuração do webhook
          </p>
        </div>
      </div>
    </div>
  );
}