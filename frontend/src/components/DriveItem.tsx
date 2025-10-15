import type { DriveInfo } from '../services/models';
import { formatSize } from '../services/utilities';

type Props = { drive: DriveInfo, explore: (path: string) => void };

function DriveItem({ drive, explore }: Props) {
    return (
        <div className='flex items-center mx-3 mt-3 border border-gray-300 rounded shadow'>
            <img src='/public/icons/drive.jpg' className='w-[60px] h-[50px] m-1 rounded-[5px]' />

            <div className='w-full flex flex-col group cursor-pointer' onClick={() => explore(drive.path)}>
                <span className='font-medium group-hover:text-blue-700 mr-2 leading-3.75'>
                    {drive.letter !== null && <span className='mr-2'>{drive.letter}:</span>}
                    {drive.label}
                </span>

                <div className='flex gap-4 text-[10px] tracking-wider ml-0.25 mt-1.25'>
                    <span>Free {formatSize(drive.size.free)}</span>
                    <span>Used {formatSize(drive.size.used)}</span>
                    <span>Total {formatSize(drive.size.total)}</span>
                </div>
            </div>
        </div>
    );
}

export default DriveItem;