import { useEffect, useState } from 'react';
import DriveItem from './components/DriveItem';
import FileItem from './components/FileItem';
import FolderItem from './components/FolderItem';
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
    goToPath(url.includes('?path=') ? url.split('?path=')[1] : '/');

    const onHistory = async (e: PopStateEvent) => {
      e.preventDefault();
      await goToPath(e.state.path, true);
    };
    window.addEventListener('popstate', onHistory);
    return () => window.removeEventListener('popstate', onHistory);
  }, []);

  async function goToPath(newPath: string, isHistory: boolean = false) {
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
      if (!isHistory) window.history.pushState({ path: newPath }, '', '?path=' + newPath);
      setPath(newPath);
    }
    catch (error) { console.error(error); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex justify-center">
      <div className="hidden md:block md:w-[20%] lg:w-[30%]"></div>

      <div className="w-full md:w-[60%] lg:w-[40%]">
        {
          path === '/'
            ? drives.map(drive => <DriveItem key={drive.path} drive={drive} goToPath={goToPath} />)
            : <>
              {folders.map(folder => <FolderItem key={folder.path} folder={folder} goToPath={goToPath} />)}
              {files.map(file => <FileItem key={file.path} file={file} />)}
            </>
        }
      </div>

      <div className="hidden md:block md:w-[20%] lg:w-[30%]"></div>
    </div>
  );
}

export default App;
