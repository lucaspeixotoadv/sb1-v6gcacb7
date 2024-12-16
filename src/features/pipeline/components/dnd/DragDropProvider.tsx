```typescript
import React from 'react';
import { DragDropContext, DragDropContextProps } from '@hello-pangea/dnd';

interface DragDropProviderProps extends DragDropContextProps {
  children: React.ReactNode;
}

export function DragDropProvider({ children, ...props }: DragDropProviderProps) {
  return (
    <DragDropContext {...props}>
      {children}
    </DragDropContext>
  );
}
```