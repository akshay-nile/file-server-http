import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import ExplorerItemsProvider from './contexts/ExplorerItems/ExplorerItemsProvider';
import Application from './routes/Application';
import Authentication from './routes/Authentication';
import ErrorDetails from './routes/ErrorDetails';
import MusicPlayer from './routes/MusicPlayer';
import { setNavigate } from './services/api';

function App() {
  const navigate = useNavigate();

  useEffect(() => { setNavigate(navigate); }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<ExplorerItemsProvider><Application /></ExplorerItemsProvider>} />
      <Route path="/authentication" element={<Authentication />} />
      <Route path="/music-player" element={<MusicPlayer />} />
      <Route path="/error" element={<ErrorDetails />} />
      <Route path="*" element={<Navigate to="/error" state={{ code: 404, status: 'Page Not Found' }} replace />} />
    </Routes>
  );
}

export default App;
