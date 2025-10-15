import type { FileInfo } from '../services/models';
import { formatDate, formatSize } from '../services/utilities';

type Props = { file: FileInfo };

function FileItem({ file }: Props) {

    function getExtention(name: string): string {
        if (!name.includes('.')) return '';
        return (name.split('.').at(-1) as string).toUpperCase();
    }

    function shouldShowCSSThumbnail(name: string): boolean {
        const extention = getExtention(name);
        return !file.thumbnail && extention.length > 0 && extention.length <= 4;
    }

    function getFontSize(name: string): string {
        const len = getExtention(name).length;
        return len > 3 ? 'text-xs' : len > 2 ? 'text-sm' : len > 1 ? 'text-lg' : 'text-2xl';
    }

    return (
        <div className='flex items-center mx-3 mt-2 border border-gray-300 rounded shadow'>
            <div className={`w-[58px] h-[50px] overflow-hidden m-1 mr-2 p-0 cursor-pointer ${file.hidden && 'opacity-70'}`}>
                {
                    shouldShowCSSThumbnail(file.name)
                        ? <div className={`h-full flex justify-center items-center rounded-[5px] bg-gray-500 text-white font-bold tracking-wide ${getFontSize(file.name)}`}>
                            {getExtention(file.name)}
                        </div>
                        : <img src={file.thumbnail ?? '/public/icons/file.jpg'}
                            className='w-full h-full object-contain object-center rounded-[5px]' />
                }
            </div>

            <div className='w-full flex flex-col group cursor-pointer justify-between'
                onClick={() => console.warn(file.path)}>
                <span className=' group-hover:text-blue-700 mr-2 text-sm leading-3.75'>
                    {file.name}
                </span>

                <div className='flex gap-4 text-[10px] tracking-wider ml-0.25 mt-1 '>
                    <span>Size {formatSize(file.size)}</span>
                    <span>{formatDate(file.date)}</span>
                </div>
            </div>
        </div>
    );
}

export default FileItem;