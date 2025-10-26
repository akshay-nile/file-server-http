import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import AppLayout from './components/AppLayout';
import Authentication from './components/Authentication';
import ServerOffline from './components/ServerOffline';
import ExplorerItemsProvider from './contexts/ExplorerItems/ExplorerItemsProvider';
import { setToast } from './services/utilities';

function App() {
  const toastRef = useRef<Toast>(null);

  const [isServerOffline, setIsServerOffline] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState('token' in localStorage);

  useEffect(() => {
    if (toastRef.current) setToast(toastRef.current);

    const onServerOffline = () => setIsServerOffline(true);
    const onAuthentication = () => setIsAuthenticated('token' in localStorage);

    window.addEventListener('serveroffline', onServerOffline);
    window.addEventListener('authentication', onAuthentication);

    return () => {
      window.removeEventListener('serveroffline', onServerOffline);
      window.removeEventListener('authentication', onAuthentication);
    };
  }, []);

  return <>
    {
      isServerOffline
        ? <ServerOffline />
        : isAuthenticated
          ? <ExplorerItemsProvider><AppLayout /></ExplorerItemsProvider>
          : <Authentication />
    }
    <Toast ref={toastRef} position='top-center' />
  </>;
}

export default App;
