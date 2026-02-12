import { Toast } from 'primereact/toast';
import { useEffect, useRef } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Authentication from './components/Authentication';
import ExplorerItemsProvider from './contexts/ExplorerItems/ExplorerItemsProvider';
import { setToast } from './services/utilities';

function App() {
  const toastRef = useRef<Toast>(null);

  useEffect(() => { if (toastRef.current) setToast(toastRef.current); }, []);

  return (
    <>
      <Routes>
        <Route path='/' element={<ExplorerItemsProvider><AppLayout /></ExplorerItemsProvider>} />
        <Route path='/authentication' element={<Authentication />} />
      </Routes>

      <Toast ref={toastRef} position='center' />
    </>
  );
}

export default App;
