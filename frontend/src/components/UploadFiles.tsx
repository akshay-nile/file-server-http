import { Button } from 'primereact/button';
import { useRef, useState } from 'react';
import { uploadFile } from '../services/api';
import { formatSize } from '../services/utilities';

type UploadProgress = { count: number, size: number, total: number }
type FileUploadInfo = { file: File; status: 'pending' | 'uploading' | 'uploaded' | 'failed'; }

function UploadFiles() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [files, setFiles] = useState<FileUploadInfo[]>([]);
    const [uploading, setUploading] = useState<boolean>(false);
    const [uploadLabel, setUploadLabel] = useState<'Upload' | 'Uploading' | 'Uploaded'>('Upload');
    const [uploadedInfo, setUploadedInfo] = useState<UploadProgress>({ count: 0, size: 0, total: 0 });

    function onFilesChoosen(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;
        const files = Array.from(e.target.files).map((file: File) => ({ file, status: 'pending' }));
        setFiles(files as FileUploadInfo[]);
        setUploadLabel('Upload');
        setUploadedInfo(prev => ({ ...prev, total: files.map(f => f.file.size).reduce((a, b) => a + b, 0) }));
    };

    async function uploadChoosenFiles() {
        setUploading(true);
        setUploadLabel('Uploading');
        for (let i = 0; i < files.length; i++) {
            if (!['pending', 'failed'].includes(files[i].status)) continue;
            files[i].status = 'uploading';
            setFiles([...files]);
            const response = await uploadFile(files[i].file);
            files[i].status = response.status;
            setFiles([...files]);
            if (files[i].status === 'uploaded') setUploadedInfo(prev => ({
                ...prev,
                count: prev.count + 1,
                size: prev.size + files[i].file.size
            }));
        }
        setUploadLabel('Uploaded');
        setTimeout(() => {
            setFiles(prevFiles => prevFiles.filter(file => file.status !== 'uploaded'));
            setUploading(false);
            setUploadLabel('Upload');
            setUploadedInfo({ count: 0, size: 0, total: 0 });
        }, 3000);
    };

    function onUploadingCancelled() {
        setFiles([]);
        setUploading(false);
        setUploadLabel('Upload');
        setUploadedInfo({ count: 0, size: 0, total: 0 });
    }

    function fileOrFiles(count: number): string {
        return count + (count < 2 ? ' file' : ' files');
    }

    return (
        <div className="flex flex-col gap-2 mb-1">
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFilesChoosen} />

            <div className="flex items-center gap-3 mt-4 mb-1">
                <Button label='Choose' icon='pi pi-plus' size='small'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={files.length > 0 || uploading}
                    style={{ padding: '0.5rem 0.8rem' }}
                />
                <Button label={uploadLabel} size='small'
                    icon={uploadLabel === 'Uploading' ? 'pi pi-spin pi-spinner' : uploadLabel === 'Uploaded' ? 'pi pi-check' : 'pi pi-upload'}
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

            <div className="text-center text-sm my-1">
                {
                    files.length === 0
                        ? uploading
                            ? <></>
                            : <div>No file selected for upload</div>
                        : uploading
                            ? <div className='flex flex-col gap-1.25'>
                                <div>
                                    Uploaded <b>{fileOrFiles(uploadedInfo.count)}</b> [{formatSize(uploadedInfo.size)}]
                                    out of <b>{fileOrFiles(files.length)}</b> [{formatSize(uploadedInfo.total)}]
                                </div>
                                <div><b>{Math.round(100 * uploadedInfo.size / uploadedInfo.total)}%</b> complete</div>
                            </div>
                            : <div>{fileOrFiles(files.length)} [{formatSize(uploadedInfo.total)}] selected for upload</div>
                }
            </div>

        </div>
    );
};

export default UploadFiles;