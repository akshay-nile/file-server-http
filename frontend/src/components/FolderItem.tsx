import { Checkbox } from 'primereact/checkbox';
import { useState } from 'react';
import type { FolderInfo } from '../services/models';

type Props = {
    folder: FolderInfo,
    explore: (path: string) => void
};

function FolderItem({ folder, explore }: Props) {
    const [checked, setChecked] = useState<boolean>(false);

    return (
        <div className='flex items-center gap-1 mx-3 mt-2 border border-gray-300 rounded shadow'>
            <img src='/public/icons/folder.jpg' className={`w-[50px] h-[50px] m-1 p-0 rounded-[5px] ${folder.hidden && 'opacity-70'}`} />
            <div className="w-full flex justify-between items-center">
                <div className='w-full flex flex-col my-1 gap-1.5 group cursor-pointer' onClick={() => explore(folder.path)}>
                    <span className='font-medium group-hover:text-blue-700 text-sm leading-3.75'>
                        {folder.name}
                    </span>
                    <div className='flex gap-4 text-[10px] tracking-wider ml-0.25'>
                        <span>Folders {folder.size[0]}</span>
                        <span>Files {folder.size[1]}</span>
                        {/* <span>{formatDate(folder.date)}</span> */}
                    </div>
                </div>
                <div className='mx-2 mb-0.5 z-0'>
                    <Checkbox onChange={e => setChecked(e.checked ?? false)} checked={checked}></Checkbox>
                </div>
            </div>
        </div>
    );
}

export default FolderItem;