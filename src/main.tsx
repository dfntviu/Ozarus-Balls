import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Fuentes autoalojadas, solo subconjunto latino (los archivos japoneses no se empaquetan)
import '@fontsource/dela-gothic-one/latin-400.css';
import '@fontsource/zen-kaku-gothic-new/latin-400.css';
import '@fontsource/zen-kaku-gothic-new/latin-700.css';
import './theme/tokens.css';
import './theme/sagas.css';
import './theme/base.css';
import { App } from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
