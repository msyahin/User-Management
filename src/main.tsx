import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ModalManagerProvider } from './components/modal/use-modal-manager.tsx'
import { modals } from './components/modal/registry.ts'
import { ModalProvider } from './components/modal/use-modal.tsx'
import { Toaster } from './components/ui/sonner.tsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <ModalManagerProvider modals={modals}>
            <App />
          <Toaster richColors position="top-right"/>
        </ModalManagerProvider>
      </ModalProvider>
    </QueryClientProvider>
  </StrictMode>,
)
