import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import App from './App.tsx';
import './index.css';
import { MemoryProvider } from "@/hooks/MemoryContext";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MemoryProvider>
      <App />
      <Toaster position="top-center" richColors />
    </MemoryProvider>
  </StrictMode>
);