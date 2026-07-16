import { PrimeReactProvider } from 'primereact/api';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import ToastContextProvider from './contexts/ToastMessage/ToastContextProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrimeReactProvider value={{ ripple: true }}>
      <ToastContextProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastContextProvider>
    </PrimeReactProvider>
  </StrictMode>
);
