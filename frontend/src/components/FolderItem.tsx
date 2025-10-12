import type { FolderInfo } from '../services/models';

type Props = { folder: FolderInfo, explore: (path: string) => void };

function FolderItem({ folder, explore }: Props) {
    return (
        <div className='flex items-center mx-3 mt-2 border border-gray-300 rounded shadow'>
            <img src='/public/icons/folder.jpg' className='w-[50px] h-[50px] m-1 mr-2 rounded-[5px]' />

            <div className='w-[calc(100%-1.5rem)] flex flex-col group cursor-pointer'
                onClick={() => explore(folder.path)}>
                <span className='group-hover:text-blue-700 mr-2 text-sm leading-3.75'>{folder.name}</span>

                <div className='text-[10px] font-mono tracking-tight ml-0.25 mt-1'>
                    <span>Folders {folder.size[0]}</span><span className='mx-2'>|</span>
                    <span>Files {folder.size[1]}</span>
                </div>
            </div>
        </div>
    );
}

export default FolderItem;