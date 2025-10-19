import { createContext } from 'react';
import type { SelectedItemsState } from '../../services/models';

const SelectedItemsContext = createContext<SelectedItemsState | undefined>(undefined);

export default SelectedItemsContext;
