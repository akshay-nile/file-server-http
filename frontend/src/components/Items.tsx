import { useEffect, useState } from 'react';
import useExplorerItems from '../contexts/ExplorerItems/useExplorerItems';
import { getThumbanil } from '../services/api';
import type { FileInfo } from '../services/models';
import { canGenerateThumbnail } from '../services/utilities';
import FileItem from './FileItem';
import FolderItem from './FolderItem';

function Items() {
    const { items } = useExplorerItems();
    const [files, setFiles] = useState<FileInfo[]>([...items.files]);

    useEffect(() => {
        let isMounted = true;

        (async () => {
            for (const file of items.files) {
                if (file.thumbnail || !canGenerateThumbnail(file.name)) continue;

                const thumbnail = await getThumbanil(file.path);
                if (!thumbnail.thumbnail) continue;

                setFiles(prevFiles => {
                    const prevFile = prevFiles.find(file => file.path === thumbnail.filepath);
                    if (prevFile) prevFile.thumbnail = thumbnail.thumbnail;
                    return prevFile ? [...prevFiles] : prevFiles;
                });

                if (!isMounted) break;
            }
        })();

        return () => { isMounted = false; };
    }, [items.files]);

    return <>
        {
            items.folders.map((folder, i) =>
                <div key={folder.path} className='mx-2'>
                    {i === 0 && <hr className='text-gray-300 m-1' />}
                    <FolderItem folder={folder} />
                    <hr className='text-gray-300 m-1' />
                </div>
            )
        }
        {
            files.map((file, i) =>
                <div key={file.path} className='mx-2'>
                    {(i === 0 && items.folders.length === 0) && <hr className='text-gray-300 m-1' />}
                    <FileItem file={file} />
                    <hr className='text-gray-300 m-1' />
                </div>
            )
        }
    </>;
}

export default Items;