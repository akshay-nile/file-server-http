import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { useRef, useState } from 'react';
import useSelectedItems from '../global-states/SelectedItems/useSelectedItems';
import { getDownloadURL, streamFile } from '../services/api';
import type { FileInfo } from '../services/models';
import { formatSize, getTooltip } from '../services/utilities';

type Props = { file: FileInfo };

function FileItem({ file }: Props) {
    const downloadAnchorRef = useRef<HTMLAnchorElement>(null);
    const [downloading, setDownloading] = useState<boolean>(false);

    const { toggleFileSelection, isItemSelected, isAnyItemSelected } = useSelectedItems();

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

    function downloadFile(file: FileInfo) {
        if (downloading || !downloadAnchorRef.current) return;
        setDownloading(true);
        downloadAnchorRef.current.click();
        const timeoutMs = Math.max(1, file.size / 1024 / 1024);
        setTimeout(() => setDownloading(false), timeoutMs * 10);
    }

    return (
        <div className='flex items-center gap-1'>
            <div className={`w-[58px] h-[50px] overflow-hidden m-1 p-0 cursor-pointer ${file.hidden && 'opacity-70'}`} onClick={() => toggleFileSelection(file)}>
                {
                    shouldShowCSSThumbnail(file.name)
                        ? <div className={`w-full h-full flex justify-center items-center rounded-[5px] bg-gray-500 text-white font-bold tracking-wide ${getFontSize(file.name)}`}>
                            {getExtention(file.name)}
                        </div>
                        : <img src={file.thumbnail ?? '/public/icons/file.jpg'} className='w-full h-full object-contain object-center rounded-[5px]' />
                }
            </div>

            <div className="w-full flex justify-between items-center">
                <div className='w-full flex flex-col my-1 gap-1.5 group cursor-pointer justify-between' onClick={() => streamFile(file.path)}>
                    <span className='group-hover:text-blue-700 text-sm leading-3.75'>
                        {file.name}
                    </span>
                    <div className='flex gap-4 text-[10px] tracking-wider ml-0.25'>
                        <span>Size {formatSize(file.size)}</span>
                    </div>
                </div>
                <div className='ml-2 mr-1 z-0'>
                    {
                        isAnyItemSelected()
                            ? <Checkbox checked={isItemSelected(file)} onChange={() => toggleFileSelection(file)} style={{ zoom: 1.2 }}
                                tooltip={getTooltip(isItemSelected(file) ? 'Unselect' : 'Select')} tooltipOptions={{ position: 'left' }} />
                            : <Button icon={`pi ${downloading ? 'pi-spin pi-spinner' : 'pi-download'}`} style={{ width: '2rem', height: '2rem', padding: '0rem' }}
                                tooltip={getTooltip(downloading ? 'Downloading' : 'Download')} tooltipOptions={{ position: 'left' }} onClick={() => downloadFile(file)} />
                    }
                </div>
                <a ref={downloadAnchorRef} href={getDownloadURL(file.path)} className='hidden' />
            </div>
        </div>
    );
}

export default FileItem;