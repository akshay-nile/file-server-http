import { Button } from 'primereact/button';
import type { DeviceInfo } from '../services/models';

type Props = { deviceInfo: DeviceInfo, path: string, explore: (path: string) => void };

function TopPanel({ deviceInfo, path, explore }: Props) {
    const icon = deviceInfo?.platform === 'Android' ? 'pi pi-mobile' : 'pi pi-desktop';
    const style = { width: '2.5rem', height: '2.5rem', padding: '0rem' };

    return (
        <div className='flex justify-between items-center border border-gray-300 rounded shadow m-3 p-2 sticky top-0 bg-gray-50'>
            <span className='flex items-center hover:text-blue-700 cursor-pointer'
                onClick={() => explore('/')}>
                <i className={`${icon} m-2 mr-2.25 shadow`} style={{ fontSize: '1.75rem' }} />
                <span className='text-xl font-normal'>{deviceInfo?.hostname}</span>
            </span>

            <div className="flex">
                <div className='me-3'>
                    <Button icon="pi pi-upload" size='large' style={style} raised
                        tooltip='Upload' tooltipOptions={{ position: 'bottom' }} />
                </div>
                <div className={path === '/' ? 'hidden' : 'me-3'}>
                    <Button icon="pi pi-search" size='large' style={style} raised
                        tooltip='Search' tooltipOptions={{ position: 'bottom' }} />
                </div>
                <div className='me-1'>
                    <Button icon="pi pi-cog" size='large' style={style} raised
                        tooltip='Setting' tooltipOptions={{ position: 'left' }} />
                </div>
            </div>
        </div>
    );
}

export default TopPanel;