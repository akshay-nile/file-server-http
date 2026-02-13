import { Toast } from 'primereact/toast';
import { useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import ExplorerItemsProvider from './contexts/ExplorerItems/ExplorerItemsProvider';
import AppLayout from './routes/AppLayout';
import Authentication from './routes/Authentication';
import ErrorDetails from './routes/ErrorDetails';
import { setNavigate } from './services/api';
import { setToast } from './services/utilities';

function App() {
  const toastRef = useRef<Toast>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (toastRef.current) setToast(toastRef.current);
    setNavigate(navigate);
  }, [navigate]);

  return (
    <>
      <Routes>
        <Route path='/' element={<ExplorerItemsProvider><AppLayout /></ExplorerItemsProvider>} />
        <Route path='/authentication' element={<Authentication />} />
        <Route path='/error' element={<ErrorDetails />} />
        <Route path='*' element={<Navigate to="/error" state={{ code: 404, status: 'Page Not Found' }} replace />} />
      </Routes>

      <Toast ref={toastRef} position='center' />
    </>
  );
}

export default App;
