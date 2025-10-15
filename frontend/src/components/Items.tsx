import { useEffect, useState } from 'react';
import { getThumbanil } from '../services/api';
import type { FileInfo, FolderInfo } from '../services/models';
import FileItem from './FileItem';
import FolderItem from './FolderItem';

// Supported file extentions for thumbnail generation
const extentions = new Set([
    'jpg', 'jpeg', 'png', 'ico', 'bmp', 'gif', 'webp',  // Supported image exentions
    'mp3', 'flac', 'wav'    // Supported audio extentions
]);

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
                if (file.thumbnail || !file.name.includes('.')) continue;

                const extention = file.name.split('.').at(-1) as string;
                if (!extentions.has(extention)) continue;

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

export default Items;