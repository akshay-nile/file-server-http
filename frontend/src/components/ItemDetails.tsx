import { useEffect, useState } from 'react';
import { getTotalSize } from '../services/api';
import type { FileInfo, FolderInfo, ItemsInfo } from '../services/models';
import { formatDate, formatSize } from '../services/utilities';

type Props = {
    type: 'folder' | 'file' | 'items',
    folder?: FolderInfo,
    file?: FileInfo,
    items?: ItemsInfo
};

function ItemDetails({ type, folder, file, items }: Props) {
    const [loading, setLoading] = useState<boolean>(false);
    const [totalSize, setTotalSize] = useState<number>(0);

    useEffect(() => {
        (async () => {
            if (type === 'folder' && folder !== undefined) {
                setLoading(true);
                const data = await getTotalSize([folder.path]);
                setTotalSize(data.totalSize);
                setLoading(false);
                return;
            }
            if (type === 'items' && items !== undefined) {
                const filesTotalSize = items.files.map(file => file.size).reduce((a, b) => a + b, 0);
                setTotalSize(filesTotalSize);
                setLoading(true);
                const data = await getTotalSize(items.folders.map(folder => folder.path));
                setTotalSize(filesTotalSize + data.totalSize);
                setLoading(false);
            }
        })();
    }, [type, folder, items]);

    return (
        <div className='flex flex-col items-center'>
            {
                (type === 'folder' && folder !== undefined) &&
                <div className='flex items-center gap-2.5'>
                    <img src='/icons/folder.jpg' width='64px' className='shadow' />
                    <div className='flex flex-col text-[13px]'>
                        <h2 className='text-[16px] font-semibold leading-4.5 mb-1'>{folder.name}</h2>
                        <span>
                            Size:&nbsp;
                            {
                                loading
                                    ? <i className='pi pi-spinner pi-spin' style={{ fontSize: '12px' }} />
                                    : formatSize(totalSize)
                            }
                            &nbsp;&nbsp; {folder.hidden && 'Hidden'}
                        </span>
                        <span>Date: {formatDate(folder.date)}</span>
                    </div>
                </div>
            }
            {
                (type === 'file' && file !== undefined) &&
                <div className='flex items-center gap-2.5'>
                    <img src={file?.thumbnail ?? '/icons/file.jpg'} width='64px' className='shadow' />
                    <div className='flex flex-col text-[13px] font-medium'>
                        <h2 className='text-[16px] font-semibold leading-4.5 mb-1'>{file.name}</h2>
                        <span>Size: {formatSize(file.size)} &nbsp;&nbsp; {file.hidden && 'Hidden'}</span>
                        <span>Date: {formatDate(file.date)}</span>
                    </div>
                </div>
            }
            {
                (type === 'items' && items !== undefined) &&
                <div className='flex flex-col text-center text-[14px] font-medium m-1'>
                    <h2 className='text-[16px] font-semibold mb-1.5'>{items.folders.length} Folders + {items.files.length} Files</h2>
                    <span>
                        Total Size:&nbsp;
                        {
                            loading
                                ? <>{formatSize(totalSize)} + <i className='pi pi-spinner pi-spin' style={{ fontSize: '12px' }} /></>
                                : formatSize(totalSize)
                        }
                    </span>
                </div>
            }
        </div>
    );
}

export default ItemDetails;