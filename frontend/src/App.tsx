import { ProgressSpinner } from 'primereact/progressspinner';
import { useEffect, useState } from 'react';
import EmptyFolder from './components/EmptyFolder';
import HomeItems from './components/HomeItems';
import PathItems from './components/PathItems';
import TopPanel from './components/TopPanel';
import { getHome, getItems } from './services/api';
import type { DeviceInfo, DriveInfo, FileInfo, FolderInfo } from './services/models';

function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [path, setPath] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [drives, setDrives] = useState<DriveInfo[]>([]);
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [files, setFiles] = useState<FileInfo[]>([]);

  useEffect(() => {
    const url = window.location.href;
    const sep = '/?path=';

    if (url.includes(sep)) (async () => {
      await explore('/', false);
      await explore(url.split(sep)[1], false);
    })();
    else explore('/');

    const onHistory = async (e: PopStateEvent) => {
      e.preventDefault();
      await explore(e.state.path, false);
    };

    window.addEventListener('popstate', onHistory);
    return () => window.removeEventListener('popstate', onHistory);
  }, []);

  async function explore(newPath: string, pushHistory: boolean = true) {
    try {
      setLoading(true);
      if (newPath === '/') {
        const data = await getHome();
        setDeviceInfo(data.device);
        setDrives(data.drives);
      } else {
        const data = await getItems(newPath);
        setFolders(data.folders);
        setFiles(data.files);
      }
      if (pushHistory) window.history.pushState({ path: newPath }, '', '?path=' + newPath);
      setPath(newPath);
    }
    catch (error) { console.error(error); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex justify-center w-screen h-screen">
      <div className="bg-gray-800 h-screen hidden md:block md:w-[20%] lg:w-[33%]"></div>

      <div className="w-full h-full md:w-[60%] lg:w-[34%]">
        {
          deviceInfo !== null &&
          <TopPanel deviceInfo={deviceInfo} path={path} explore={explore} />
        }

        {
          loading
            ? <div className='h-[66%] flex justify-center items-center'>
              <ProgressSpinner strokeWidth='0.2rem' animationDuration='0.5s' />
            </div>
            : path === '/'
              ? <HomeItems drives={drives} explore={explore} />
              : folders.length > 0 || files.length > 0
                ? <PathItems folders={folders} files={files} explore={explore} />
                : <EmptyFolder />
        }
      </div>

      <div className="bg-gray-800 h-full hidden md:block md:w-[20%] lg:w-[33%]"></div>
    </div>
  );
}

export default App;
