import useExplorerItems from '../contexts/ExplorerItems/useExplorerItems';
import type { DriveInfo } from '../services/models';
import { formatSize } from '../services/utilities';

type Props = { drive: DriveInfo };

function DriveItem({ drive }: Props) {
    const { explore } = useExplorerItems();

    return (
        <div className='flex items-center gap-1'>
            <img src='/icons/drive.jpg' className='w-[60px] h-[50px] m-1 p-0 rounded-[5px]' />

            <div className='w-full flex flex-col my-1 gap-1.75 group cursor-pointer' onClick={() => explore(drive.path, true)}>
                <span className='font-medium group-hover:text-blue-700 leading-3.75 min-w-0 break-words break-all'>
                    {drive.letter !== null && <span className='mr-1.5'>{drive.letter}:</span>}
                    {drive.label}
                </span>

                <div className='flex gap-4 text-[10px] tracking-wider ml-0.25'>
                    <span>Free {formatSize(drive.size.free)}</span>
                    <span>Used {formatSize(drive.size.used)}</span>
                    <span>Total {formatSize(drive.size.total)}</span>
                </div>
            </div>
        </div>
    );
}

export default DriveItem;