import { createContext } from 'react';
import type { ExplorerItemsState } from '../../services/models';

const ExplorerItemsContext = createContext<ExplorerItemsState | undefined>(undefined);

export default ExplorerItemsContext;
