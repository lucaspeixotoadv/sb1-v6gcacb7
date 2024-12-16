import React from 'react';
import { Handle, Position, Connection } from 'reactflow';

interface BaseNodeProps {
  id?: string;
  data?: any;
  isTarget?: boolean;
  isSource?: boolean;
  children: React.ReactNode;
  className?: string;
  sourceHandleClassName?: string;
  targetHandleClassName?: string;
  validateConnection?: (connection: Connection) => boolean;
  onNodeClick?: (e: React.MouseEvent) => void;
}

export function BaseNode({
  id,
  data,
  isTarget = true,
  isSource = true,
  children,
  className = '',
  sourceHandleClassName = '',
  targetHandleClassName = '',
  validateConnection,
  onNodeClick
}: BaseNodeProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeClick?.(e);
  };

  return (
    <div
      className={`
        bg-white 
        rounded-lg 
        border-2 
        shadow-sm 
        transition-colors
        hover:shadow-md
        ${className}
      `}
      onClick={handleClick}
    >
      {isTarget && (
        <Handle
          type="target"
          position={Position.Left}
          className={`
            w-3 
            h-3 
            rounded-full
            border-2
            border-white
            !bg-blue-500
            ${targetHandleClassName}
          `}
          isValidConnection={validateConnection}
        />
      )}

      {children}

      {isSource && (
        <Handle
          type="source"
          position={Position.Right}
          className={`
            w-3 
            h-3 
            rounded-full
            border-2
            border-white
            !bg-blue-500
            ${sourceHandleClassName}
          `}
          isValidConnection={validateConnection}
        />
      )}
    </div>
  );
}