import { Button } from 'primereact/button';
import { useEffect, useState } from 'react';
import useExplorerItems from '../contexts/ExplorerItems/useExplorerItems';
import { getTooltip } from '../services/utilities';
import SearchItems from './SearchItems';
import UploadFiles from './UploadFiles';
import UserSettings from './UserSettings';

function TopPanel() {
    const { path, home, explore } = useExplorerItems();

    const style = { width: '2.55rem', height: '2.5rem', padding: '0rem' };
    const icon = home.device.platform === undefined
        ? 'pi pi-spin pi-spinner'
        : home.device.platform === 'Android'
            ? 'pi pi-mobile'
            : 'pi pi-desktop';

    const [panelOpened, setPanelOpened] = useState<boolean>(false);
    const [panelContent, setPanelContent] = useState<null | 'search' | 'upload' | 'settings'>(null);

    useEffect(() => {
        if (path === '/') {
            setPanelOpened(false);
            setTimeout(() => setPanelContent(null), 333);
        }
        const onSearchPageCache = () => {
            setPanelContent('search');
            setPanelOpened(true);
        };
        addEventListener('searchpagecache', onSearchPageCache);
        return () => { removeEventListener('searchpagecache', onSearchPageCache); };
    }, [path]);

    function togglePanel(newContent: typeof panelContent) {
        if (panelOpened) {
            if (newContent === panelContent) {   // Close the panel and remove the content
                setPanelOpened(false);
                setTimeout(() => {
                    setPanelContent(null);
                    dispatchEvent(new Event(`on${newContent}panelclose`));
                }, 333);
            } else setPanelContent(newContent);  // Keep panel open and switch the content
        } else {
            setPanelContent(newContent);  // Set content first and then open the panel
            setPanelOpened(true);
        }
    }

    return (
        <div className="flex flex-col items-center border border-gray-300 rounded shadow m-3 p-2">
            <div className='w-full flex justify-between items-center'>
                <span className='flex items-center hover:text-blue-700 cursor-pointer' onClick={() => explore('/', true)}>
                    <i className={`${icon} m-2 mr-2.25 shadow`} style={{ fontSize: '1.75rem' }} />
                    <span className='text-xl font-normal'>{home.device?.hostname}</span>
                </span>

                <div className='flex'>
                    <div className='mr-3'>
                        <Button size='large' style={style} raised
                            icon={(panelOpened && panelContent === 'upload') ? 'pi pi-times' : 'pi pi-upload'}
                            severity={(panelOpened && panelContent === 'upload') ? 'danger' : undefined}
                            tooltip={getTooltip('Upload')} tooltipOptions={{ position: 'bottom' }}
                            onClick={() => togglePanel('upload')} />
                    </div>
                    <div className={path === '/' ? 'hidden' : 'mr-3'}>
                        <Button size='large' style={style} raised
                            icon={(panelOpened && panelContent === 'search') ? 'pi pi-times' : 'pi pi-search'}
                            severity={(panelOpened && panelContent === 'search') ? 'danger' : undefined}
                            tooltip={getTooltip('Search')} tooltipOptions={{ position: 'bottom' }}
                            onClick={() => togglePanel('search')} />
                    </div>
                    <div className='mr-1'>
                        <Button size='large' style={style} raised
                            icon={(panelOpened && panelContent === 'settings') ? 'pi pi-times' : 'pi pi-cog'}
                            severity={(panelOpened && panelContent === 'settings') ? 'danger' : undefined}
                            tooltip={getTooltip('Settings')} tooltipOptions={{ position: 'left' }}
                            onClick={() => togglePanel('settings')} />
                    </div>
                </div>
            </div>

            <div className={`${panelOpened ? 'max-h-[50vh] opacity-100' : 'max-h-0 opacity-50'} overflow-hidden transition-all duration-300 ease-in-out`}>
                <div className={panelContent === 'upload' ? 'block' : 'hidden'}><UploadFiles /></div>
                <div className={panelContent === 'search' ? 'block' : 'hidden'}><SearchItems /></div>
                <div className={panelContent === 'settings' ? 'block' : 'hidden'}><UserSettings /></div>
            </div>
        </div >
    );
}

export default TopPanel;