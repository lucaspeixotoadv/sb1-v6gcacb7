import React from 'react';
import { PipelineProvider } from '../../features/pipeline/context/PipelineContext';
import { ContactsProvider } from '../../contexts/ContactsContext';
import { MessagingProvider } from '../../contexts/MessagingContext';
import { CRMPreview } from '../../pages/CRMPreview';

export function CRMRoot() {
  return (
    <PipelineProvider>
      <ContactsProvider>
        <MessagingProvider>
          <CRMPreview />
        </MessagingProvider>
      </ContactsProvider>
    </PipelineProvider>
  );
}