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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    if (toastRef.current) setToast(toastRef.current);

    const onServerOffline = () => setIsServerOffline(true);
    const onAuthSuccess = () => setIsAuthenticated(true);
    const onAuthFailed = () => setIsAuthenticated(false);

    window.addEventListener('serveroffline', onServerOffline);
    window.addEventListener('authsuccess', onAuthSuccess);
    window.addEventListener('authfailed', onAuthFailed);

    return () => {
      window.removeEventListener('serveroffline', onServerOffline);
      window.removeEventListener('authsuccess', onAuthSuccess);
      window.removeEventListener('authfailed', onAuthFailed);
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
    <Toast ref={toastRef} position='center' />
  </>;
}

export default App;
