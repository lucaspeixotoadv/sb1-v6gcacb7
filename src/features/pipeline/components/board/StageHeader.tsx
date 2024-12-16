import React from 'react';
import { formatCurrency } from '../../../../utils/formatters';
import type { Stage } from '../../../../types';

interface StageHeaderProps {
  stage: Stage;
}

export function StageHeader({ stage }: StageHeaderProps) {
  const totalValue = stage.deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-4" data-stage-id={stage.id}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900">{stage.name}</h3>
        <span className="text-sm text-gray-500">{stage.deals.length}</span>
      </div>
      <div className="text-sm text-gray-600">
        Total: {formatCurrency(totalValue)}
      </div>
    </div>
  );
}