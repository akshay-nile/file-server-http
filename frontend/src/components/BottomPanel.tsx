import { Button } from 'primereact/button';
import useSelectedItems from '../contexts/SelectedItems/useSelectedItems';
import { getTooltip } from '../services/utilities';

function BottomPanel() {
    const { isAnyItemSelected, clearSelection } = useSelectedItems();
    const style = { width: '2.55rem', height: '2.5rem', padding: '0rem' };

    return (
        <div className={`flex items-center gap-2 fixed left-1/2 -translate-x-1/2 bg-white rounded shadow-lg border border-gray-300 p-3 z-10 transition-all duration-500 ease-in-out 
        ${isAnyItemSelected() ? 'bottom-[30px] translate-y-0 opacity-100' : '-bottom-full translate-y-full opacity-0'}`}>
            <Button size='large' style={style} raised
                icon='pi pi-times'
                tooltip={getTooltip('Clear')} tooltipOptions={{ position: 'top' }}
                onClick={clearSelection} />
        </div>
    );
}

export default BottomPanel;