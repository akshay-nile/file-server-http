import { useEffect, useState } from 'react';
import { getThumbanil, getThumbanils } from '../services/api';
import type { FileInfo, FolderInfo } from '../services/models';
import FileItem from './FileItem';
import FolderItem from './FolderItem';

type Props = {
    path: string,
    folders: Array<FolderInfo>,
    subFiles: Array<FileInfo>,
    explore: (path: string) => void
};

function FolderItems({ folders, subFiles, path, explore }: Props) {
    const [files, setFiles] = useState<FileInfo[]>(subFiles);

    useEffect(() => {
        (async () => {
            // Fetch and load all cached thumbnails in a single request
            const thumbnails = await getThumbanils(path);
            setFiles(prevFiles => {
                thumbnails.forEach(thumbnail => {
                    const file = prevFiles.find(file => file.path === thumbnail.filepath);
                    if (file) file.thumbnail = thumbnail.thumbnailURL;
                });
                return [...prevFiles];
            });

            // Generate and load remaining thumbnails awaiting sequentially
            const filepaths = thumbnails.map(thumbnail => thumbnail.filepath);
            for (const subFile of subFiles) {
                if (filepaths.includes(subFile.path)) continue;
                const thumbnail = await getThumbanil(subFile.path);
                if (thumbnail.thumbnailURL === '/public/icons/file.jpg') continue;
                setFiles(prevFiles => {
                    const prevFile = prevFiles.find(file => file.path === thumbnail.filepath);
                    if (!prevFile) return prevFiles;
                    prevFile.thumbnail = thumbnail.thumbnailURL;
                    return [...prevFiles];
                });
            }
        })();
    }, [path, subFiles]);

    return <>
        {
            folders.map(folder => <FolderItem
                key={folder.path}
                folder={folder}
                explore={explore} />)
        }
        {
            files.map(file => <FileItem
                key={file.path}
                file={file} />)
        }
    </>;
}

export default FolderItems;