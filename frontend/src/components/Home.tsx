import useExplorerItems from '../contexts/ExplorerItems/useExplorerItems';
import type { FileInfo, FolderInfo, ItemsInfo } from '../services/models';
import DriveItem from './DriveItem';
import FileItem from './FileItem';
import FolderItem from './FolderItem';

function Home() {
    const { home } = useExplorerItems();
    const { folders, files } = (home.clipboard.type === 'items' ? home.clipboard.content : [[], []]) as ItemsInfo;

    return <>
        {
            home.drives.length > 0 &&
            <div className='mt-4 mx-3 border border-gray-300 rounded shadow'>
                <div className='m-0 p-2 bg-gray-200 font-bold'>
                    <span className='mx-1'>Drives</span>
                </div>
                {
                    home.drives.map((drive, i) =>
                        <div key={drive.path} className='mx-1'>
                            {i === 0 && <hr className='text-gray-300 m-1' />}
                            <DriveItem drive={drive} />
                            <hr className='text-gray-300 m-1' />
                        </div>
                    )
                }
            </div>
        }
        {
            home.clipboard.type !== 'error' &&
            <div className='mt-4 mx-3 border border-gray-300 rounded shadow'>
                <div className='m-0 p-2 bg-gray-200 font-bold flex justify-between'>
                    <span className='mx-1'>Clipboard</span>
                </div>
                {
                    home.clipboard.type === 'items' &&
                    <>
                        {
                            folders.map((folder: FolderInfo, i: number) =>
                                <div key={folder.path} className='mx-1'>
                                    {i === 0 && <hr className='text-gray-300 m-1' />}
                                    <FolderItem folder={folder} />
                                    <hr className='text-gray-300 m-1' />
                                </div>
                            )
                        }
                        {
                            files.map((file: FileInfo, i: number) =>
                                <div key={file.path} className='mx-1'>
                                    {(i === 0 && folders.length === 0) && <hr className='text-gray-300 m-1' />}
                                    <FileItem file={file} />
                                    <hr className='text-gray-300 m-1' />
                                </div>
                            )
                        }
                    </>
                }
                {
                    home.clipboard.type === 'text' &&
                    <pre contentEditable suppressContentEditableWarning spellCheck={false} autoCorrect="off" autoCapitalize="off"
                        className='p-3 font-mono text-sm whitespace-pre overflow-x-auto break-keep select-text outline-none focus:outline-none focus:ring-0'>
                        {home.clipboard.content as string}
                    </pre>
                }
            </div>
        }
    </>;
}

export default Home;