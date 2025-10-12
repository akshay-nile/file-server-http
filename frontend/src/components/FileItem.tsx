import type { FileInfo } from '../services/models';

type Props = { file: FileInfo };

function FileItem({ file }: Props) {

    function formatDate(secondsFromEpoch: number): string {
        const date = new Date(secondsFromEpoch * 1000);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        const hours24 = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        const ampm = hours24 >= 12 ? 'PM' : 'AM';
        const hours12 = String(hours24 % 12 || 12).padStart(2, '0');

        return `${day}-${month}-${year} ${hours12}:${minutes}:${seconds} ${ampm}`;
    }

    return (
        <div className='flex items-center mx-3 mt-2 border border-gray-300 rounded shadow'>
            <img src='/public/icons/file.jpg' className='w-[50px] h-[50px] m-1 mr-2 rounded-[5px]' />

            <div className='w-[calc(100%-1.5rem)] flex flex-col group cursor-pointer justify-between'
                onClick={() => console.warn(file.path)}>
                <span className='group-hover:text-blue-700 mr-2 text-sm leading-3.75'>{file.name}</span>

                <div className='text-[10px] font-mono tracking-tight ml-0.25 mt-1 '>
                    <span>Size {file.size}</span><span className='mx-2'>|</span>
                    <span>{formatDate(file.date)}</span>
                </div>
            </div>
        </div>
    );
}

export default FileItem;