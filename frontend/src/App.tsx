import { useEffect, useState } from 'react';
import AppLayout from './components/AppLayout';
import Authentication from './components/Authentication';
import ExplorerItemsProvider from './contexts/ExplorerItems/ExplorerItemsProvider';
import ServerOffline from './components/ServerOffline';

function App() {
  const [isServerOffline, setIsServerOffline] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState('token' in localStorage);

  useEffect(() => {
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
  </>;
}

export default App;
