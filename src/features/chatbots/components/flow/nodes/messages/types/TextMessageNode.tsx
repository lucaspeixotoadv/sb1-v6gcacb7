// src/features/chatbots/components/flow/nodes/messages/types/TextMessageNode.tsx

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { BaseNode } from '../../BaseNode';
import { TextMessageConfigModal } from '../config/TextMessageConfigModal';
import type { TextNodeData } from '../../../types/nodes';

interface TextMessageNodeProps {
 data: TextNodeData;
 selected: boolean;
 onChange: (data: TextNodeData) => void;
 onOpenModal: (modal: React.ReactNode) => void;
}

export function TextMessageNode({ data, selected, onChange, onOpenModal }: TextMessageNodeProps) {
 const [showConfig, setShowConfig] = React.useState(false);

 const handleClick = (e: React.MouseEvent) => {
   e.stopPropagation();
   setShowConfig(true);
 };

 const handleClose = () => {
   setShowConfig(false);
 };

 const handleSave = (updatedData: TextNodeData) => {
   onChange(updatedData);
   setShowConfig(false);
 };

 React.useEffect(() => {
   if (showConfig) {
     onOpenModal(
       <TextMessageConfigModal
         isOpen={true}
         data={data}
         onClose={handleClose}
         onSave={handleSave}
       />
     );
   } else {
     onOpenModal(null);
   }
 }, [showConfig, data, onOpenModal]);

 return (
   <BaseNode 
     data={data}
     className={`
       cursor-pointer transition-all
       ${!data.content ? 'border-dashed' : ''}
       hover:border-blue-500 hover:shadow-md
       ${selected ? 'ring-2 ring-blue-500' : ''}
     `}
     onNodeClick={handleClick}
   >
     <div className="p-4">
       <div className="flex items-center gap-2 mb-2">
         <MessageSquare size={16} className="text-blue-500" />
         <span className="font-medium">Mensagem de Texto</span>
         {data.waitForResponse && (
           <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
             Aguarda Resposta
           </span>
         )}
       </div>

       <p className="text-sm text-gray-600 line-clamp-2">
         {data.content || 'Clique para configurar'}
       </p>

       {data.waitForResponse && (
         <div className="mt-2 text-xs text-gray-500">
           <p>Variável: {data.waitForResponse.variableName}</p>
           {data.waitForResponse.timeout?.enabled && (
             <p>
               Timeout: {data.waitForResponse.timeout.value} {data.waitForResponse.timeout.unit}
             </p>
           )}
         </div>
       )}
     </div>
   </BaseNode>
 );
}