import { useContext } from 'react';
import ExplorerItemsContext from './ExplorerItemsContext';

function useExplorerItems() {
    const context = useContext(ExplorerItemsContext);
    if (!context) throw new Error('This hook can be used inside ExplorerItemsProvider only');
    return context;
}

export default useExplorerItems;