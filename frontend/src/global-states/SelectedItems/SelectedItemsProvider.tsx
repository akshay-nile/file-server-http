import { useState, type ReactNode } from 'react';
import SelectedItemsContext from './SelectedItemsContext';
import type { FileInfo, FolderInfo, SelectedItemsState } from '../../services/models';

type Props = { children: ReactNode };

function SelectedItemsProvider({ children }: Props) {
    const [selectedFolders, setSelectedFolders] = useState<FolderInfo[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([]);

    function toggleFolderSelection(folder: FolderInfo) {
        setSelectedFolders(prevFolders => prevFolders.includes(folder)
            ? prevFolders.filter(prevFolder => prevFolder.path !== folder.path)
            : [...prevFolders, folder]
        );
    }

    function toggleFileSelection(file: FileInfo) {
        setSelectedFiles(prevFiles => prevFiles.includes(file)
            ? prevFiles.filter(prevFile => prevFile.path !== file.path)
            : [...prevFiles, file]
        );
    }

    function clearSelection() {
        setSelectedFolders([]);
        setSelectedFiles([]);
    }

    const value: SelectedItemsState = {
        selectedFolders,
        selectedFiles,
        toggleFolderSelection,
        toggleFileSelection,
        clearSelection
    };

    return (
        <SelectedItemsContext.Provider value={value}>
            {children}
        </SelectedItemsContext.Provider>
    );
}

export default SelectedItemsProvider;