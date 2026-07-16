import { useContext } from 'react';
import SelectedItemsContext from './SelectedItemsContext';

function useSelectedItems() {
    const context = useContext(SelectedItemsContext);
    if (!context) throw new Error('This hook can be used inside SelectedItemsProvider only');
    return context;
}

export default useSelectedItems;