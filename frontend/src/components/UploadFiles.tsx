import { Button } from 'primereact/button';
import { useRef, useState } from 'react';
import { uploadFile } from '../services/api';
import { formatSize } from '../services/utilities';

type FileUploadInfo = {
    file: File;
    status: 'pending' | 'uploading' | 'uploaded' | 'failed';
}

function UploadFiles() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [files, setFiles] = useState<FileUploadInfo[]>([]);
    const [uploading, setUploading] = useState<boolean>(false);

    function onFilesChoosen(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;
        const selectedFiles = Array.from(e.target.files).map((file: File) => ({ file, status: 'pending' }));
        setFiles(selectedFiles as FileUploadInfo[]);
    };

    async function uploadChoosenFiles() {
        setUploading(true);
        for (let i = 0; i < files.length; i++) {
            if (!['pending', 'failed'].includes(files[i].status)) continue;
            files[i].status = 'uploading';
            setFiles([...files]);
            const response = await uploadFile(files[i].file);
            files[i].status = response.status;
            setFiles([...files]);
        }
        setFiles(prevFiles => prevFiles.filter(file => file.status !== 'uploaded'));
        setUploading(false);
    };

    function onUploadingCancelled() {
        setFiles([]);
        setUploading(false);
    }

    return (
        <div className="flex flex-col gap-2 mb-1">
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFilesChoosen} />

            <div className="flex items-center gap-4 mt-4 mb-1">
                <Button label='Choose' icon='pi pi-plus' size='small'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={files.length > 0 || uploading}
                    style={{ padding: '0.5rem 0.8rem' }}
                />
                <Button label='Upload' icon={uploading ? 'pi pi-spin pi-spinner' : 'pi pi-upload'} size='small'
                    onClick={uploadChoosenFiles}
                    disabled={files.length === 0 || uploading}
                    style={{ padding: '0.5rem 0.8rem' }}
                />
                <Button label='Cancel' icon='pi pi-times' size='small'
                    onClick={onUploadingCancelled}
                    disabled={files.length === 0}
                    style={{ padding: '0.5rem 0.8rem' }}
                />
            </div>

            {
                files.length > 0 &&
                <ul className='w-full'>
                    {files.map(file => <li key={file.file.name + file.file.size}>
                        <div className='flex gap-2 text-sm font-medium my-2'>
                            <span className='flex-6 text-left'>{file.file.name}</span>
                            <span className='flex-2 text-center'>{formatSize(file.file.size)}</span>
                            <span className='flex-2 text-right capitalize'>{file.status}</span>
                        </div>
                    </li>)}
                </ul>
            }

        </div>
    );
};

export default UploadFiles;