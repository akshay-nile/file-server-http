import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useEffect, useRef, useState } from 'react';
import useSelectedItems from '../contexts/SelectedItems/useSelectedItems';
import { getFileURL } from '../services/api';
import type { FileInfo, FolderInfo, ItemInfo } from '../services/models';
import { getShortcuts, setShortcuts } from '../services/settings';
import { getTooltip, toast } from '../services/utilities';
import ItemDetails from './ItemDetails';

type ItemDetailsType = {
    type: 'folder' | 'file' | 'items',
    item: FolderInfo | FileInfo | ItemInfo[]
};

function BottomPanel() {
    const { selectedFiles, selectedFolders, isAnyItemSelected, clearSelection } = useSelectedItems();
    const style = { width: '2.55rem', height: '2.5rem', padding: '0rem' };

    const itemDetailsRef = useRef<OverlayPanel>(null);
    const [itemsDetails, setItemDetails] = useState<ItemDetailsType | null>(null);
    const [showAddShortcuts, setShowAddShortcuts] = useState<boolean>(true);
    const [showMultiDownload, setShowMultiDownload] = useState<boolean>(false);

    useEffect(() => {
        // Show remove-from-shortcuts button 
        // If all the selected items are already included in marked shortcuts
        // Otherwise show the add-to-shortcuts button
        const shortcuts = getShortcuts();
        if (!shortcuts) { setShowAddShortcuts(true); }
        else {
            const shortcutItemPaths = [...shortcuts.folders, ...shortcuts.files].map(item => item.path);
            const selectedItemPaths = [...selectedFolders, ...selectedFiles].map(item => item.path);
            setShowAddShortcuts(!selectedItemPaths.every(selectedItemPath => shortcutItemPaths.includes(selectedItemPath)));
        }

        // Show multi-download button
        // If at least 2 or more files are selected and no folder is selected
        setShowMultiDownload(selectedFolders.length === 0 && selectedFiles.length >= 2);

        // Set item-details on selection of either single folder or single file or multiple items 
        if (selectedFolders.length === 1 && selectedFiles.length === 0) {
            setItemDetails({ type: 'folder', item: selectedFolders[0] });
        } else if (selectedFolders.length === 0 && selectedFiles.length === 1) {
            setItemDetails({ type: 'file', item: selectedFiles[0] });
        } else if ((selectedFolders.length + selectedFiles.length) > 1) {
            setItemDetails({ type: 'items', item: [...selectedFolders, ...selectedFiles] });
        } else {
            itemDetailsRef.current?.hide();
            setItemDetails(null);
        }
    }, [selectedFiles, selectedFolders]);

    function addToShortcuts() {
        const shortcuts = getShortcuts();
        let count = 0;
        if (shortcuts === null) {
            setShortcuts({ folders: selectedFolders, files: selectedFiles });
            count += selectedFolders.length + selectedFiles.length;
        } else {
            selectedFolders.forEach(selectedFolder => {
                if (!shortcuts.folders.find(shotcutFolder => shotcutFolder.path === selectedFolder.path)) {
                    shortcuts.folders.push(selectedFolder);
                    count += 1;
                }
            });
            selectedFiles.forEach(selectedFile => {
                if (!shortcuts.files.find(shotcutFile => shotcutFile.path === selectedFile.path)) {
                    shortcuts.files.push(selectedFile);
                    count += 1;
                }
            });
            setShortcuts(shortcuts);
        }
        clearSelection();
        window.dispatchEvent(new Event('onshortcutschange'));
        toast.show({
            severity: 'success',
            summary: 'Shortcuts Added',
            detail: count + ' new item(s) added to shortcuts.'
        });
    }

    function removeFromShortcuts() {
        const shortcuts = getShortcuts();
        let count = 0;
        if (shortcuts === null) return;
        selectedFolders.forEach(selectedFolder => {
            const i = shortcuts.folders.findIndex(shotcutFolder => shotcutFolder.path === selectedFolder.path);
            if (i !== -1) { shortcuts.folders.splice(i, 1); count += 1; }
        });
        selectedFiles.forEach(selectedFile => {
            const i = shortcuts.files.findIndex(shotcutFile => shotcutFile.path === selectedFile.path);
            if (i !== -1) { shortcuts.files.splice(i, 1); count += 1; }
        });
        setShortcuts(shortcuts);
        clearSelection();
        window.dispatchEvent(new Event('onshortcutschange'));
        toast.show({
            severity: 'warn',
            summary: 'Shortcuts Removed',
            detail: count + ' item(s) removed from shortcuts.'
        });
    }

    async function downloadAllFiles() {
        const downloadFiles = [...selectedFiles];
        downloadFiles.sort((a, b) => a.size - b.size);
        let delayMs = 5000;
        clearSelection();
        for (const file of downloadFiles) {
            window.location.href = getFileURL(file.path, false);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            if (delayMs > 1000) delayMs -= 1000;
        }
    }

    return (
        <div className={`flex items-center gap-3 fixed left-1/2 -translate-x-1/2 bg-white rounded-md shadow-lg border border-gray-300 p-3 z-10 transition-all duration-500 ease-in-out 
        ${isAnyItemSelected() ? 'bottom-[30px] translate-y-0 opacity-100' : '-bottom-full translate-y-full opacity-0'}`}>
            <Button size='large' style={style} raised icon='pi pi-info-circle'
                tooltip={getTooltip('Show Details')} tooltipOptions={{ position: 'top' }}
                onClick={e => itemDetailsRef.current?.toggle(e)} />

            {
                showMultiDownload &&
                <Button size='large' style={style} raised icon='pi pi-download'
                    tooltip={getTooltip('Download All')} tooltipOptions={{ position: 'top' }}
                    onClick={downloadAllFiles} />
            }

            <Button size='large' style={style} raised pt={{ icon: { className: showAddShortcuts ? 'rotate-0' : 'rotate-180' } }}
                icon='pi pi-thumbtack' severity={showAddShortcuts ? undefined : 'danger'}
                tooltip={getTooltip(showAddShortcuts ? 'Add Shortcuts' : 'Remove Shortcuts')} tooltipOptions={{ position: 'top' }}
                onClick={() => showAddShortcuts ? addToShortcuts() : removeFromShortcuts()} />

            <Button size='large' style={style} raised
                icon='pi pi-times' severity='danger'
                tooltip={getTooltip('Clear')} tooltipOptions={{ position: 'top' }}
                onClick={clearSelection} />

            <OverlayPanel ref={itemDetailsRef} showCloseIcon closeOnEscape dismissable={false} className='max-w-[90%]'>
                {
                    itemsDetails?.type === 'folder'
                        ? <ItemDetails type='folder' folder={itemsDetails.item as FolderInfo} file={undefined} items={undefined} />
                        : itemsDetails?.type === 'file'
                            ? <ItemDetails type='file' folder={undefined} file={itemsDetails.item as FileInfo} items={undefined} />
                            : <ItemDetails type='items' folder={undefined} file={undefined} items={itemsDetails?.item as Array<ItemInfo>} />
                }
            </OverlayPanel>
        </div>
    );
}

export default BottomPanel;