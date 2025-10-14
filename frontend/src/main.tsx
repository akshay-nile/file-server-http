import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PrimeReactProvider } from 'primereact/api';
import Authentication from './components/Authentication.tsx';
import App from './App.tsx';
import './index.css';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const browserIdExists = 'file-server-browser-id' in localStorage;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrimeReactProvider value={{ ripple: true }}>
      {browserIdExists ? <App /> : <Authentication />}
    </PrimeReactProvider>
  </StrictMode>
);
