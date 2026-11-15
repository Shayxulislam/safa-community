import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { storage } from './services/storage';

async function bootstrap(): Promise<void> {
  try {
    await storage.hydratePublicContent();
  } catch {
    // Keep the bundled and browser-cached content available if Supabase is unreachable.
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
