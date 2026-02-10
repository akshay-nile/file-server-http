import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import AppLayout from './components/AppLayout';
import Authentication from './components/Authentication';
import ExplorerItemsProvider from './contexts/ExplorerItems/ExplorerItemsProvider';
import { setToast } from './services/utilities';

function App() {
  const toastRef = useRef<Toast>(null);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    if (toastRef.current) setToast(toastRef.current);

    const onAuthentication = () => setIsAuthenticated(false);
    window.addEventListener('authentication', onAuthentication);
    return () => window.removeEventListener('authentication', onAuthentication);
  }, []);

  return <>
    {
      isAuthenticated
        ? <ExplorerItemsProvider><AppLayout /></ExplorerItemsProvider>
        : <Authentication onVerify={() => setIsAuthenticated(true)} />
    }
    <Toast ref={toastRef} position='center' />
  </>;
}

export default App;
