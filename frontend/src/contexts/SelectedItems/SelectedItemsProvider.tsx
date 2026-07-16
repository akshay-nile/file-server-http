import { useState, type ReactNode } from 'react';
import type { FileInfo, FolderInfo, ItemInfo, SelectedItemsState } from '../../services/models';
import useExplorerItems from '../ExplorerItems/useExplorerItems';
import SelectedItemsContext from './SelectedItemsContext';

type Props = { children: ReactNode };

function SelectedItemsProvider({ children }: Props) {
    const { items } = useExplorerItems();

    const [selectedFolders, setSelectedFolders] = useState<FolderInfo[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([]);

    function toggleFolderSelection(folder: FolderInfo) {
        setSelectedFolders(prevFolders => isItemSelected(folder)
            ? prevFolders.filter(prevFolder => prevFolder.path !== folder.path)
            : [...prevFolders, folder]
        );
    }

    function toggleFileSelection(file: FileInfo) {
        setSelectedFiles(prevFiles => isItemSelected(file)
            ? prevFiles.filter(prevFile => prevFile.path !== file.path)
            : [...prevFiles, file]
        );
    }

    function isItemSelected(item: ItemInfo): boolean {
        if (selectedFolders.find(folder => folder.path === item.path)) return true;
        if (selectedFiles.find(file => file.path === item.path)) return true;
        return false;
    }

    function isAnyItemSelected(): boolean {
        return selectedFolders.length > 0 || selectedFiles.length > 0;
    }

    function selectAllItems() {
        setSelectedFolders(items.folders);
        setSelectedFiles(items.files);
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
        isItemSelected,
        isAnyItemSelected,
        selectAllItems,
        clearSelection
    };

    return (
        <SelectedItemsContext.Provider value={value}>
            {children}
        </SelectedItemsContext.Provider>
    );
}

export default SelectedItemsProvider;