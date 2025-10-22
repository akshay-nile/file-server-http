import { Checkbox } from 'primereact/checkbox';
import useExplorerItems from '../contexts/ExplorerItems/useExplorerItems';
import useSelectedItems from '../contexts/SelectedItems/useSelectedItems';
import type { FolderInfo } from '../services/models';
import { getTooltip } from '../services/utilities';

type Props = { folder: FolderInfo };

function FolderItem({ folder }: Props) {
    const { path, explore } = useExplorerItems();
    const { toggleFolderSelection, isItemSelected, isAnyItemSelected } = useSelectedItems();

    return (
        <div className='flex items-center gap-1'>
            <img src='/public/icons/folder.jpg' className={`w-[50px] h-[50px] m-1 p-0 rounded-[5px] ${folder.hidden && 'opacity-70'}`} onClick={() => path !== '/' && toggleFolderSelection(folder)} />
            <div className="w-full flex justify-between items-center">
                <div className='w-full flex flex-col my-1 gap-1.5 group cursor-pointer' onClick={() => explore(folder.path, true)}>
                    <span className='font-medium group-hover:text-blue-700 text-sm leading-3.75'>
                        {folder.name}
                    </span>
                    <div className='flex gap-4 text-[10px] tracking-wider ml-0.25'>
                        <span>Folders {folder.size[0]}</span>
                        <span>Files {folder.size[1]}</span>
                    </div>
                </div>
                {
                    (path !== '/' && isAnyItemSelected()) &&
                    <div className='ml-2 mr-1 z-0'>
                        <Checkbox checked={isItemSelected(folder)} onChange={() => toggleFolderSelection(folder)} style={{ zoom: 1.2 }}
                            tooltip={getTooltip(isItemSelected(folder) ? 'Unselect' : 'Select')} tooltipOptions={{ position: 'left' }} />
                    </div>
                }
            </div>
        </div>
    );
}

export default FolderItem;