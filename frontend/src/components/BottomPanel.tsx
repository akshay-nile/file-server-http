import { Button } from 'primereact/button';
import { useEffect, useState } from 'react';
import useSelectedItems from '../contexts/SelectedItems/useSelectedItems';
import { getShortcuts, setShortcuts } from '../services/settings';
import { getTooltip } from '../services/utilities';

function BottomPanel() {
    const { selectedFiles, selectedFolders, isAnyItemSelected, clearSelection } = useSelectedItems();
    const style = { width: '2.55rem', height: '2.5rem', padding: '0rem' };

    const [showAddShortcuts, setShowAddShortcuts] = useState<boolean>(true);

    useEffect(() => {
        // Show remove-from-shortcuts button 
        // If all the selected items are already included in marked shortcuts
        // Otherwise show the add-to-shortcuts button
        const shortcuts = getShortcuts();
        if (!shortcuts) {
            setShowAddShortcuts(true);
            return;
        }
        const shortcutItemPaths = [...shortcuts.folders, ...shortcuts.files].map(item => item.path);
        const selectedItemPaths = [...selectedFolders, ...selectedFiles].map(item => item.path);
        setShowAddShortcuts(!selectedItemPaths.every(selectedItemPath => shortcutItemPaths.includes(selectedItemPath)));
    }, [selectedFiles, selectedFolders]);

    function addToShortcuts() {
        const shortcuts = getShortcuts();
        if (shortcuts === null) {
            setShortcuts({ folders: selectedFolders, files: selectedFiles });
        } else {
            selectedFolders.forEach(selectedFolder => {
                if (!shortcuts.folders.find(shotcutFolder => shotcutFolder.path === selectedFolder.path)) {
                    shortcuts.folders.push(selectedFolder);
                }
            });
            selectedFiles.forEach(selectedFile => {
                if (!shortcuts.files.find(shotcutFile => shotcutFile.path === selectedFile.path)) {
                    shortcuts.files.push(selectedFile);
                }
            });
            setShortcuts(shortcuts);
        }
        clearSelection();
        window.dispatchEvent(new Event('onshortcutschange'));
    }

    function removeFromShortcuts() {
        const shortcuts = getShortcuts();
        if (shortcuts === null) return;
        selectedFolders.forEach(selectedFolder => {
            const i = shortcuts.folders.findIndex(shotcutFolder => shotcutFolder.path === selectedFolder.path);
            if (i !== -1) shortcuts.folders.splice(i, 1);
        });
        selectedFiles.forEach(selectedFile => {
            const i = shortcuts.files.findIndex(shotcutFile => shotcutFile.path === selectedFile.path);
            if (i !== -1) shortcuts.files.splice(i, 1);
        });
        setShortcuts(shortcuts);
        clearSelection();
        window.dispatchEvent(new Event('onshortcutschange'));
    }

    return (
        <div className={`flex items-center gap-3 fixed left-1/2 -translate-x-1/2 bg-white rounded-md shadow-lg border border-gray-300 p-3 z-10 transition-all duration-500 ease-in-out 
        ${isAnyItemSelected() ? 'bottom-[30px] translate-y-0 opacity-100' : '-bottom-full translate-y-full opacity-0'}`}>
            <Button size='large' style={style} raised
                icon='pi pi-thumbtack' severity={showAddShortcuts ? undefined : 'danger'}
                tooltip={getTooltip(showAddShortcuts ? 'Add Shortcuts' : 'Remove Shortcuts')} tooltipOptions={{ position: 'top' }}
                onClick={() => showAddShortcuts ? addToShortcuts() : removeFromShortcuts()} />
            <Button size='large' style={style} raised
                icon='pi pi-times' severity='danger'
                tooltip={getTooltip('Clear')} tooltipOptions={{ position: 'top' }}
                onClick={clearSelection} />
        </div>
    );
}

export default BottomPanel;