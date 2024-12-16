import React, { memo } from 'react';
import { Calendar, DollarSign, Tag, Edit2, X, Check, Settings } from 'lucide-react';
import { Draggable } from 'react-beautiful-dnd';
import { DealModal } from './DealModal';
import type { Deal } from '../../../types';
import { useContacts } from '../../../hooks/useContacts';
import { usePipeline } from '../../../hooks/usePipeline';

interface DealCardProps {
  deal: Deal;
  index: number;
  stageId: string;
}

export const DealCard = memo(function DealCard({ deal, index, stageId }: DealCardProps) {
  const { contacts } = useContacts();
  const { updateDeal, deleteDeal } = usePipeline();
  const contact = contacts.find(c => c.id === deal.contactId);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedDeal, setEditedDeal] = React.useState(deal);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleSave = () => {
    updateDeal(deal.id, editedDeal);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedDeal(deal);
    setIsEditing(false);
  };

  const handleDelete = (dealId: string) => {
    deleteDeal(dealId);
    setIsModalOpen(false);
  };

  return (
    <>
      <Draggable draggableId={deal.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`relative bg-white rounded-lg shadow-sm border p-4 ${
              snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}
          >
            {/* Cabeçalho do DealCard */}
            <div className="flex items-start justify-between mb-2">
              {isEditing ? (
                <input
                  type="text"
                  value={editedDeal.title}
                  onChange={(e) => setEditedDeal(prev => ({ ...prev, title: e.target.value }))}
                  className="flex-1 px-2 py-1 border rounded mr-2"
                />
              ) : (
                <h4 className="font-medium text-gray-900 truncate flex-1">{deal.title}</h4>
              )}
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="p-1 text-gray-500 hover:text-gray-700 relative z-20"
                      title="Cancelar"
                    >
                      <X size={16} />
                    </button>
                    <button
                      onClick={handleSave}
                      className="p-1 text-blue-500 hover:text-blue-700 relative z-20"
                      title="Salvar"
                    >
                      <Check size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-gray-500 hover:text-gray-700 relative z-10"
                      title="Editar Rápido"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="p-1 text-gray-500 hover:text-gray-700 relative z-10"
                      title="Editar Detalhes"
                    >
                      <Settings size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Prioridade do Deal */}
            <div className="mb-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  deal.priority === 'high'
                    ? 'bg-red-100 text-red-800'
                    : deal.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {deal.priority === 'high'
                  ? 'Alta'
                  : deal.priority === 'medium'
                  ? 'Média'
                  : 'Baixa'}
              </span>
            </div>

            {/* Informações do Contato */}
            {contact && (
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                  {contact.photoUrl ? (
                    <img
                      src={contact.photoUrl}
                      alt={contact.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-indigo-600 font-medium">
                      {contact.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="truncate">{contact.name}</span>
              </div>
            )}

            {/* Detalhes do Deal */}
            <div className="space-y-2">
              {/* Valor do Deal */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="w-4 h-4" />
                {isEditing ? (
                  <input
                    type="number"
                    value={editedDeal.value}
                    onChange={(e) =>
                      setEditedDeal(prev => ({ ...prev, value: Number(e.target.value) }))
                    }
                    className="w-32 px-2 py-1 border rounded"
                  />
                ) : (
                  <span>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(deal.value)}
                  </span>
                )}
              </div>

              {/* Data de Vencimento */}
              {deal.dueDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedDeal.dueDate?.toISOString().split('T')[0]}
                      onChange={(e) =>
                        setEditedDeal(prev => ({
                          ...prev,
                          dueDate: e.target.value ? new Date(e.target.value) : undefined,
                        }))
                      }
                      className="px-2 py-1 border rounded"
                    />
                  ) : (
                    <span>{new Date(deal.dueDate).toLocaleDateString()}</span>
                  )}
                </div>
              )}

              {/* Tags do Deal */}
              {deal.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <div className="flex flex-wrap gap-1">
                    {deal.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>

      {/* Modal para Detalhes do Deal */}
      {isModalOpen && deal && (
        <DealModal
          deal={deal}
          onClose={() => setIsModalOpen(false)}
          onSave={(updatedDeal) => {
            updateDeal(deal.id, updatedDeal);
            setIsModalOpen(false);
          }}
          onDelete={handleDelete}
        />
      )}
    </>
  );
});