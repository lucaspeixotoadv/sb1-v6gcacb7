import React, { useCallback, useMemo } from 'react';
import { FlowToolbar } from './FlowToolbar';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  MarkerType,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  ReactFlowProvider
} from 'reactflow';
import { createPortal } from 'react-dom';
import 'reactflow/dist/style.css';

import { TextMessageNode } from './nodes/messages/types/TextMessageNode';
import type { FlowConfig } from '../../types';
import type { TextNodeData } from '../../types/nodes';

interface FlowEditorProps {
  initialConfig: FlowConfig;
  onChange: (config: FlowConfig) => void;
  onSave: () => void;
}

export function FlowEditor({ initialConfig, onChange, onSave }: FlowEditorProps) {
  const [nodes, setNodes] = React.useState<Node[]>(initialConfig?.nodes || []);
  const [edges, setEdges] = React.useState<Edge[]>(initialConfig?.edges || []);
  const [modalPortal, setModalPortal] = React.useState<React.ReactNode | null>(null);

  const handleNodeDataChange = useCallback((nodeId: string, updatedData: TextNodeData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...updatedData
            }
          };
        }
        return node;
      })
    );
  }, []);

  // Memorizando o NODE_TYPES
  const nodeTypes = useMemo(
    () => ({
      'message-text': (props: any) => (
        <TextMessageNode
          {...props}
          onChange={(updatedData: TextNodeData) => handleNodeDataChange(props.id, updatedData)}
          onOpenModal={(modal: React.ReactNode) => setModalPortal(modal)}
        />
      )
    }),
    [handleNodeDataChange]
  );

  const handleAddNode = useCallback((type: string) => {
    const position = {
      x: Math.random() * 500,
      y: Math.random() * 500
    };

    const baseType = type.split('-')[1] || type;

    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: {
        type: baseType,
        content: '',
        waitForResponse: null
      }
    };

    setNodes(prev => [...prev, newNode]);
    onChange({ nodes: [...nodes, newNode], edges });
  }, [nodes, edges, onChange]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      setNodes(updatedNodes);
      onChange({ nodes: updatedNodes, edges });
    },
    [nodes, edges, onChange]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const updatedEdges = applyEdgeChanges(changes, edges);
      setEdges(updatedEdges);
      onChange({ nodes, edges: updatedEdges });
    },
    [nodes, edges, onChange]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        markerEnd: { type: MarkerType.ArrowClosed },
        animated: true
      };
      const updatedEdges = addEdge(newEdge, edges);
      setEdges(updatedEdges);
      onChange({ nodes, edges: updatedEdges });
    },
    [nodes, edges, onChange]
  );

  // Efeito para propagar mudanças nos nós para o componente pai
  React.useEffect(() => {
    onChange({ nodes, edges });
  }, [nodes, edges, onChange]);

  return (
    <ReactFlowProvider>
      <div className="flex w-full h-full">
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
        
        <FlowToolbar onAddNode={handleAddNode} onSave={onSave} />
      </div>
      {modalPortal && createPortal(modalPortal, document.body)}
    </ReactFlowProvider>
  );
}