```typescript
import React from 'react';
import { Droppable as DndDroppable, DroppableProps } from '@hello-pangea/dnd';

interface CustomDroppableProps extends Omit<DroppableProps, 'children'> {
  children: React.ReactNode;
}

export function Droppable({ children, ...props }: CustomDroppableProps) {
  return (
    <DndDroppable {...props}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {children}
          {provided.placeholder}
        </div>
      )}
    </DndDroppable>
  );
}
```