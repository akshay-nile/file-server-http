import { ProgressSpinner } from 'primereact/progressspinner';
import { useEffect, useState } from 'react';
import { getHome, getItems } from './services/api';
import type { DeviceInfo, Drive, File, Folder } from './services/models';

function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [path, setPath] = useState<string>('/');
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [drives, setDrives] = useState<Drive[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (path === '/') {
          const data = await getHome();
          setDeviceInfo(data.device);
          setDrives(data.drives);
        } else {
          const data = await getItems(path);
          setFolders(data.folders);
          setFiles(data.files);
        }
      }
      catch (error) { console.error(error); }
      finally { setLoading(false); }
    })();
  }, [path]);

  return (<>
    <div onClick={() => setPath('/')} className='text-2xl cursor-pointer flex justify-around'>
      <span>{deviceInfo?.hostname}</span>
      <span>{deviceInfo?.platform}</span>
    </div>
    <div className='text-xl font-light text-center'>
      {
        path === '/'
          ? loading ? <ProgressSpinner /> : <ul>
            {drives.map(drive =>
              <li key={drive.path} onClick={() => setPath(drive.path)} className='cursor-pointer'>
                {drive.label}
              </li>)}
          </ul>
          : loading ? <ProgressSpinner /> : <ul>
            {folders.map(folder =>
              <li key={folder.path} onClick={() => setPath(folder.path)} className='cursor-pointer'>
                {folder.name}
              </li>)}
            {files.map(file =>
              <li key={file.path} className='cursor-pointer'>
                {file.name}
              </li>)}
          </ul>
      }
    </div>
  </>
  );
}

export default App;
