import type { FileInfo, FolderInfo } from '../services/models';
import FileItem from './FileItem';
import FolderItem from './FolderItem';

type Props = {
    folders: Array<FolderInfo>,
    files: Array<FileInfo>,
    explore: (path: string) => void
};

function PathItems({ folders, files, explore }: Props) {
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

export default PathItems;