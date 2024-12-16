import React from 'react';

export function PipelineFilters() {
  return (
    <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 border-b">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Responsável
        </label>
        <select className="w-full p-2 border rounded-lg">
          <option value="">Todos</option>
          <option value="me">Meus Negócios</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prioridade
        </label>
        <select className="w-full p-2 border rounded-lg">
          <option value="">Todas</option>
          <option value="high">Alta</option>
          <option value="medium">Média</option>
          <option value="low">Baixa</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select className="w-full p-2 border rounded-lg">
          <option value="">Todos</option>
          <option value="active">Ativos</option>
          <option value="won">Ganhos</option>
          <option value="lost">Perdidos</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <select className="w-full p-2 border rounded-lg">
          <option value="">Todas</option>
        </select>
      </div>
    </div>
  );
}