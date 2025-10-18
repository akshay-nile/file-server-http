import { useEffect, useState } from 'react';
import AppLayout from './components/AppLayout';
import Authentication from './components/Authentication';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState('verification-code' in localStorage);

  useEffect(() => {
    const onAuthentication = () => setIsAuthenticated('verification-code' in localStorage);
    window.addEventListener('authentication', onAuthentication);
    return () => window.removeEventListener('authentication', onAuthentication);
  }, []);

  return <>{isAuthenticated ? <AppLayout /> : <Authentication />}</>;
}

export default App;
