import { useEffect, useState } from 'react';
import { getThumbanil } from '../services/api';
import type { FileInfo, FolderInfo } from '../services/models';
import { canGenerateThumbnail } from '../services/utilities';
import FileItem from './FileItem';
import FolderItem from './FolderItem';

type Props = {
    folders: Array<FolderInfo>,
    subFiles: Array<FileInfo>,
    explore: (path: string) => void
};

function Items({ folders, subFiles, explore }: Props) {
    const [files, setFiles] = useState<FileInfo[]>(subFiles);

    useEffect(() => {
        let isMounted = true;

        (async () => {
            for (const file of subFiles) {
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
    }, [subFiles]);

    return <>
        {
            folders.map((folder, i) =>
                <div key={folder.path} className='mx-2'>
                    {i === 0 && <hr className='text-gray-300 m-1' />}
                    <FolderItem folder={folder} explore={explore} />
                    <hr className='text-gray-300 m-1' />
                </div>
            )
        }
        {
            files.map((file, i) =>
                <div key={file.path} className='mx-2'>
                    {(i === 0 && folders.length === 0) && <hr className='text-gray-300 m-1' />}
                    <FileItem file={file} />
                    <hr className='text-gray-300 m-1' />
                </div>
            )
        }
    </>;
}

export default Items;