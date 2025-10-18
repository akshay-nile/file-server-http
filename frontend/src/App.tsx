import { useEffect, useState } from 'react';
import AppLayout from './components/AppLayout';
import Authentication from './components/Authentication';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState('token' in localStorage);

  useEffect(() => {
    const onAuthentication = () => setIsAuthenticated('token' in localStorage);
    window.addEventListener('authentication', onAuthentication);
    return () => window.removeEventListener('authentication', onAuthentication);
  }, []);

  return <>{isAuthenticated ? <AppLayout /> : <Authentication />}</>;
}

export default App;
