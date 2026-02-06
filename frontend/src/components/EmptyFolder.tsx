import { useEffect, useState } from 'react';
import useExplorerItems from '../contexts/ExplorerItems/useExplorerItems';

type Props = { protectedPaths: Array<string> };

function EmptyFolder({ protectedPaths }: Props) {
    const { path } = useExplorerItems();
    const [isProtected, setIsProtected] = useState<boolean>(false);

    useEffect(() => { setIsProtected(protectedPaths.some(p => path.startsWith(p))); }, [path, protectedPaths]);

    return (
        <div className='h-[66vh] flex flex-col justify-center items-center text-center text-2xl text-gray-600'>
            <img src={'/public/icons/' + (isProtected ? 'protected-folder.png' : 'empty-folder.png')} width='180px' />
            <div className='my-8 font-semibold'>{isProtected ? 'Protected' : 'Empty'} Folder</div>
        </div>
    );
}

export default EmptyFolder;