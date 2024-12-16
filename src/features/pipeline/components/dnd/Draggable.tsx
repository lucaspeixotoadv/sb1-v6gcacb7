```typescript
import React from 'react';
import { Draggable as DndDraggable, DraggableProps } from '@hello-pangea/dnd';

interface CustomDraggableProps extends Omit<DraggableProps, 'children'> {
  children: React.ReactNode;
}

export function Draggable({ children, ...props }: CustomDraggableProps) {
  return (
    <DndDraggable {...props}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {children}
        </div>
      )}
    </DndDraggable>
  );
}
```