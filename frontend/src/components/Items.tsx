import { useEffect, useState } from 'react';
import useExplorerItems from '../contexts/ExplorerItems/useExplorerItems';
import { getThumbanil } from '../services/api';
import type { FileInfo } from '../services/models';
import { setMusicPlayerData } from '../services/settings';
import { canGenerateThumbnail } from '../services/utilities';
import EmptyFolder from './EmptyFolder';
import FileItem from './FileItem';
import FolderItem from './FolderItem';

function Items() {
    const { home, items } = useExplorerItems();
    const [files, setFiles] = useState<FileInfo[]>([]);

    useEffect(() => {
        setFiles([...items.files]);
        let isMounted = true;

        (async () => {
            for (const file of items.files) {
                if (file.thumbnail || !canGenerateThumbnail(file.name, home.device.platform)) continue;

                const data = await getThumbanil(file.path);
                if (data === null) return;
                if (!data.thumbnail) continue;

                setFiles(prevFiles => {
                    const prevFile = prevFiles.find(file => file.path === data.filepath);
                    if (prevFile) prevFile.thumbnail = data.thumbnail;
                    return prevFile ? [...prevFiles] : prevFiles;
                });

                if (!isMounted) break;
            }
        })();

        return () => { isMounted = false; };
    }, [items.files, home.device.platform]);

    function onMusicPlay(file: FileInfo) {
        const songs = files.filter(f => f.mimetype.startsWith('audio'));
        const index = songs.findIndex(s => s.path === file.path);
        setMusicPlayerData({ songs, index });
        window.open('/music-player', 'music-player');
        const channel = new BroadcastChannel('music_channel');
        channel.postMessage(null);  // Send signal to reload music data in already opened tab
        setTimeout(() => channel.close(), 1000);  // Close the channel after 1 second
    }

    return <>
        {
            (items.folders.length === 0 && items.files.length === 0)
                ? <EmptyFolder />
                : <>
                    {
                        items.folders.map((folder, i) =>
                            <div key={folder.path} className='mx-2'>
                                {i === 0 && <hr className='text-gray-300 m-1' />}
                                <FolderItem folder={folder} selectable={true} />
                                <hr className='text-gray-300 m-1' />
                            </div>
                        )
                    }
                    {
                        files.map((file, i) =>
                            <div key={file.path} className='mx-2'>
                                {(i === 0 && items.folders.length === 0) && <hr className='text-gray-300 m-1' />}
                                <FileItem file={file} selectable={true} onMusicPlay={onMusicPlay} />
                                <hr className='text-gray-300 m-1' />
                            </div>
                        )
                    }
                </>
        }
    </>;
}

export default Items;