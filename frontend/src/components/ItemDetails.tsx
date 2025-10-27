import type { FileInfo, FolderInfo, ItemInfo } from '../services/models';
import { formatDate, formatSize } from '../services/utilities';

type Props = {
    type: 'folder' | 'file' | 'items',
    folder: FolderInfo | undefined,
    file: FileInfo | undefined,
    items: ItemInfo[] | undefined
};

function ItemDetails({ type, folder, file, items }: Props) {
    return (
        <div className='flex flex-col items-center'>
            {
                type === 'folder' &&
                <div className='flex items-center gap-2.5'>
                    <img src='/public/icons/folder.jpg' width='64px' className='shadow' />
                    <div className='flex flex-col text-[13px]'>
                        <h2 className='text-[16px] font-semibold leading-4.5 mb-1'>{folder?.name}</h2>
                        <span>Size: {formatSize(folder?.size as number)} &nbsp;&nbsp; {folder?.hidden && 'Hidden'}</span>
                        <span>Date: {formatDate(folder?.date as number)}</span>
                    </div>
                </div>
            }
            {
                type === 'file' &&
                <div className='flex items-center gap-2.5'>
                    <img src={file?.thumbnail ?? '/public/icons/file.jpg'} width='64px' className='shadow' />
                    <div className='flex flex-col text-[13px] font-medium'>
                        <h2 className='text-[16px] font-semibold leading-4.5 mb-1'>{file?.name}</h2>
                        <span>Size: {formatSize(file?.size as number)} &nbsp;&nbsp; {file?.hidden && 'Hidden'}</span>
                        <span>Date: {formatDate(file?.date as number)}</span>
                    </div>
                </div>
            }
            {
                type === 'items' &&
                <div className='flex flex-col text-center text-[14px] font-medium m-1'>
                    <h2 className='text-[16px] font-semibold mb-1.5'>{items?.length} Items Selected</h2>
                    <span>Total Size: {formatSize(items?.map(item => item.size).reduce((a, b) => a + b, 0) as number)}</span>
                </div>
            }
        </div>
    );
}

export default ItemDetails;