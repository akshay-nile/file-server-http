import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useEffect, useRef, useState } from 'react';
import useExplorerItems from '../contexts/ExplorerItems/useExplorerItems';
import useSelectedItems from '../contexts/SelectedItems/useSelectedItems';
import { getFileURL, modifyItems } from '../services/api';
import type { FileInfo, FolderInfo, ItemInfo, ItemsInfo } from '../services/models';
import { getShortcuts, setShortcuts } from '../services/settings';
import { getTooltip, searchInfo, toast } from '../services/utilities';
import ItemDetails from './ItemDetails';
import RenameItem from './RenameItem';

type ItemDetailsType = {
    type: 'folder' | 'file' | 'items',
    selection: FolderInfo | FileInfo | ItemsInfo
};

type DialogInfo = {
    itemToRename: ItemInfo,
    onRename: (name: string) => void
};

function BottomPanel() {
    const { path, items, explore } = useExplorerItems();
    const { selectedFiles, selectedFolders, isAnyItemSelected, selectAllItems, clearSelection } = useSelectedItems();

    const style = { width: '2.55rem', height: '2.5rem', padding: '0rem' };

    const itemsRef = useRef<ItemsInfo>(null);
    const itemDetailsRef = useRef<OverlayPanel>(null);

    const [status, setStatus] = useState<'none' | 'donwloading' | 'deleting' | 'renaming'>('none');
    const [itemsDetails, setItemDetails] = useState<ItemDetailsType | null>(null);
    const [dialogInfo, setDialogInfo] = useState<DialogInfo | null>(null);

    const [showAddShortcuts, setShowAddShortcuts] = useState<boolean>(true);
    const [showMultiDownload, setShowMultiDownload] = useState<boolean>(false);
    const [showSelectAll, setShowSelectAll] = useState<boolean>(false);
    const [showDelete, setShowDelete] = useState<boolean>(false);
    const [showRename, setShowRename] = useState<boolean>(false);

    useEffect(() => { itemsRef.current = items; }, [items]);

    useEffect(() => {
        const totalSelected = selectedFolders.length + selectedFiles.length;
        const totalAvailable = itemsRef.current ? itemsRef.current.folders.length + itemsRef.current.files.length : 0;

        // If all the selected items are already included in marked shortcuts, then show remove-from-shortcuts button
        // Otherwise show the add-to-shortcuts button
        const shortcuts = getShortcuts();
        if (!shortcuts) { setShowAddShortcuts(true); }
        else {
            const shortcutItemPaths = [...shortcuts.folders, ...shortcuts.files].map(item => item.path);
            const selectedItemPaths = [...selectedFolders, ...selectedFiles].map(item => item.path);
            setShowAddShortcuts(!selectedItemPaths.every(selectedItemPath => shortcutItemPaths.includes(selectedItemPath)));
        }

        // Set item-details on depending on the current selection 
        if (selectedFolders.length === 1 && selectedFiles.length === 0) {
            setItemDetails({ type: 'folder', selection: selectedFolders[0] });
        } else if (selectedFolders.length === 0 && selectedFiles.length === 1) {
            setItemDetails({ type: 'file', selection: selectedFiles[0] });
        } else if (totalSelected > 1) {
            setItemDetails({ type: 'items', selection: { folders: selectedFolders, files: selectedFiles } });
        } else {
            itemDetailsRef.current?.hide();
            setItemDetails(null);
        }

        // Show multi-download button
        // If at least 2 or more files are selected and no folder is selected
        setShowMultiDownload(selectedFolders.length === 0 && selectedFiles.length >= 2);

        // Show select-all button
        // If at least one and not all the items are selected
        setShowSelectAll(totalSelected > 0 && totalSelected < totalAvailable);

        // Show delete button
        // If one or more item are selected
        setShowDelete(totalSelected > 0);

        // Show rename button
        // If only one item is selected
        setShowRename(totalSelected === 1);
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
        window.dispatchEvent(new Event('shortcutschange'));
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
        window.dispatchEvent(new Event('shortcutschange'));
        toast.show({
            severity: 'warn',
            summary: 'Shortcuts Removed',
            detail: count + ' item(s) removed from shortcuts.'
        });
    }

    async function downloadAllFiles() {
        setStatus('donwloading');
        const downloadFiles = [...selectedFiles];
        downloadFiles.sort((a, b) => a.size - b.size);
        let delayMs = 5000;
        for (const file of downloadFiles) {
            window.location.href = getFileURL(file.path, false);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            if (delayMs > 1000) delayMs -= 1000;
        }
        setStatus('none');
        clearSelection();
    }

    async function deleteItems() {
        const itemsToDelete = [...selectedFolders, ...selectedFiles].map(item => item.path);
        const accept = async () => {
            setStatus('deleting');
            const response = await modifyItems('delete', itemsToDelete);
            if (response && response.count === itemsToDelete.length) toast.show({
                severity: 'success', summary: 'Deleted',
                detail: response.count + ' item(s) has been deleted.'
            });
            else toast.show({
                severity: 'error', summary: 'Deletion Failed',
                detail: response.count + ' item(s) were deleted.'
            });
            setStatus('none');
            clearSelection();
            if (searchInfo && searchInfo.filteredItems) {
                searchInfo.filteredItems.folders = searchInfo.filteredItems.folders.filter(f => itemsToDelete.includes(f.path));
                searchInfo.filteredItems.files = searchInfo.filteredItems.files.filter(f => itemsToDelete.includes(f.path));
            }
            explore(path, false);
        };
        confirmDialog({
            message: `Delete ${itemsToDelete.length} item(s) Permanently?`,
            header: 'Delete Confirmation',
            closable: false,
            icon: 'pi pi-exclamation-triangle',
            position: 'center',
            accept, reject: undefined
        });
    }

    async function renameItem() {
        const itemToRename: ItemInfo = [...selectedFolders, ...selectedFiles][0];
        const onRename = async (name: string) => {
            setDialogInfo(null);
            setStatus('renaming');
            const response = await modifyItems('rename', [itemToRename.path, path + '/' + name]);
            if (response && response.count === 1) {
                toast.show({ severity: 'success', summary: 'Renamed', detail: 'Item renamed to ' + name });
                if (searchInfo && searchInfo.filteredItems) {
                    const itemRenamed = [...searchInfo.filteredItems.folders, ...searchInfo.filteredItems.files].find(f => f.path === itemToRename.path);
                    if (itemRenamed) itemRenamed.name = name;
                }
            }
            else toast.show({ severity: 'error', summary: 'Renaming Failed', detail: itemToRename.name + ' could not be renamed.' });
            setStatus('none');
            clearSelection();
            explore(path, false);
        };
        setDialogInfo({ itemToRename, onRename });
    }

    return (
        <div className="fixed inset-x-0 bottom-0 flex justify-center pointer-events-none z-10">
            <div className={`
                flex items-center gap-3 transition-all duration-300 ease-in-out 
                bg-white rounded-md shadow-lg border border-gray-300 p-3 pointer-events-auto
                ${isAnyItemSelected() ? 'mb-[30px] opacity-100' : 'translate-y-20 opacity-0'}
            `}>
                <Button size='large' style={style} raised icon='pi pi-info-circle'
                    tooltip={getTooltip('Show Details')} tooltipOptions={{ position: 'top' }}
                    onClick={e => itemDetailsRef.current?.toggle(e)} />

                {
                    (showDelete && path !== '/') &&
                    <Button size='large' style={style} raised
                        icon={`pi ${status === 'deleting' ? 'pi-spin pi-spinner' : 'pi-trash'}`}
                        tooltip={getTooltip('Delete')} tooltipOptions={{ position: 'top' }}
                        onClick={() => status === 'none' && deleteItems()} />
                }

                {
                    (showRename && path !== '/') &&
                    <Button size='large' style={style} raised
                        icon={`pi ${status === 'renaming' ? 'pi-spin pi-spinner' : 'pi-pen-to-square'}`}
                        tooltip={getTooltip('Rename')} tooltipOptions={{ position: 'top' }}
                        onClick={() => status === 'none' && renameItem()} />
                }

                {
                    showMultiDownload &&
                    <Button size='large' style={style} raised
                        icon={`pi ${status === 'donwloading' ? 'pi-spin pi-spinner' : 'pi-download'}`}
                        tooltip={getTooltip('Download All')} tooltipOptions={{ position: 'top' }}
                        onClick={() => status === 'none' && downloadAllFiles()} />
                }

                <Button size='large' style={style} raised pt={{ icon: { className: showAddShortcuts ? 'rotate-0' : 'rotate-180' } }}
                    icon='pi pi-thumbtack' severity={showAddShortcuts ? undefined : 'danger'}
                    tooltip={getTooltip(showAddShortcuts ? 'Add Shortcuts' : 'Remove Shortcuts')} tooltipOptions={{ position: 'top' }}
                    onClick={() => showAddShortcuts ? addToShortcuts() : removeFromShortcuts()} />

                {
                    (showSelectAll && path !== '/') &&
                    <Button size='large' style={style} raised icon='pi pi-list-check'
                        tooltip={getTooltip('Select All')} tooltipOptions={{ position: 'top' }}
                        onClick={selectAllItems} />
                }

                <Button size='large' style={style} raised
                    icon='pi pi-times' severity='danger'
                    tooltip={getTooltip('Clear')} tooltipOptions={{ position: 'top' }}
                    onClick={clearSelection} />

                <OverlayPanel ref={itemDetailsRef} showCloseIcon closeOnEscape dismissable={false} className='max-w-[80%]'>
                    {
                        itemsDetails?.type === 'folder'
                            ? <ItemDetails type='folder' folder={itemsDetails.selection as FolderInfo} />
                            : itemsDetails?.type === 'file'
                                ? <ItemDetails type='file' file={itemsDetails.selection as FileInfo} />
                                : <ItemDetails type='items' items={itemsDetails?.selection as ItemsInfo} />
                    }
                </OverlayPanel>

                <ConfirmDialog />

                {
                    dialogInfo !== null &&
                    <Dialog header='Rename Item' pt={{ root: { className: 'w-[95%] md:w-[60%] lg:w-[34%]' } }}
                        visible={dialogInfo !== null} onHide={() => setDialogInfo(null)}>
                        <RenameItem itemToRename={dialogInfo.itemToRename} isFileItem={selectedFiles.length === 1 && selectedFolders.length === 0}
                            onRename={dialogInfo.onRename} onCancel={() => setDialogInfo(null)} />
                    </Dialog>
                }
            </div>
        </div>
    );
}

export default BottomPanel;