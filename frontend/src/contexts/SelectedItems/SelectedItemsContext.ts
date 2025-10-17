import { createContext } from 'react';
import type { SelectedItemsState } from '../../services/models';

const SelectedItemsContext = createContext<SelectedItemsState | null>(null);

export default SelectedItemsContext;
