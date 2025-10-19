import { ProgressSpinner } from 'primereact/progressspinner';
import { useEffect, useState } from 'react';
import Breadcrumb from './Breadcrumb';
import EmptyFolder from './EmptyFolder';
import TopPanel from './TopPanel';
import { getHome, getItems } from '../services/api';
import type { DeviceInfo, DriveInfo, FileInfo, FolderInfo } from '../services/models';
import Home from './Home';
import Items from './Items';
import SelectedItemsProvider from '../contexts/SelectedItems/SelectedItemsProvider';

function AppLayout() {
    const [loading, setLoading] = useState<boolean>(false);
    const [path, setPath] = useState<string>('');
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
    const [drives, setDrives] = useState<DriveInfo[]>([]);
    const [folders, setFolders] = useState<FolderInfo[]>([]);
    const [files, setFiles] = useState<FileInfo[]>([]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const path = params.get('path');

        (async () => {
            if (path) {
                await explore('/', false);
                if (path !== '/') await explore(path, false);
            } else await explore('/', true);
        })();

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
                const data = await getHome(); // Fetch server-device and drives info
                setDeviceInfo(data.device);
                setDrives(data.drives);
            } else {
                const data = await getItems(newPath); // Fetch folder and files info
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
        <div className="w-full flex justify-center">
            <SelectedItemsProvider>
                <div className="bg-gray-50 min-h-screen w-full md:w-[60%] lg:w-[34%]">
                    {
                        deviceInfo !== null &&
                        <div className='sticky top-0 bg-gray-50 z-10'>
                            <TopPanel deviceInfo={deviceInfo} path={path} explore={explore} />
                            {
                                (path !== '' && path !== '/') &&
                                <Breadcrumb path={path} platform={deviceInfo.platform} explore={explore} />
                            }
                        </div>
                    }
                    {
                        loading
                            ? <div className='h-[66%] flex justify-center items-center'>
                                <ProgressSpinner strokeWidth='0.2rem' animationDuration='0.5s' />
                            </div>
                            : path === '/'
                                ? <Home drives={drives} explore={explore} />
                                : (folders.length > 0 || files.length > 0)
                                    ? <Items folders={folders} subFiles={files} explore={explore} />
                                    : <EmptyFolder />
                    }
                </div>
            </SelectedItemsProvider>
        </div>
    );
}

export default AppLayout;
