import type { DriveInfo } from '../services/models';

type Props = { drive: DriveInfo, explore: (path: string) => void };

function DriveItem({ drive, explore }: Props) {
    return (
        <div className='flex items-center mx-3 mt-3 border border-gray-300 rounded shadow'>
            <img src='/public/icons/drive.jpg' className='w-[60px] h-[50px] m-1 rounded-[5px]' />

            <div className='w-full flex flex-col group cursor-pointer'
                onClick={() => explore(drive.path)}>
                <span className='group-hover:text-blue-700 mr-2 leading-3.75'>
                    {drive.letter !== null && <span className='mr-2'>{drive.letter}:</span>}
                    {drive.label}
                </span>

                <div className='text-[10px] font-mono tracking-tighter ml-0.25 mt-1'>
                    <span>Free {drive.size.free}</span><span className='mx-2'>|</span>
                    <span>Used {drive.size.used}</span><span className='mx-2'>|</span>
                    <span>Total {drive.size.free}</span>
                </div>
            </div>
        </div>
    );
}

export default DriveItem;