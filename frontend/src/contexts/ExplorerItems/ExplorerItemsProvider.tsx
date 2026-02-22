import { useCallback, useState, type ReactNode } from 'react';
import { getHome, getItems } from '../../services/api';
import type { ExplorerItemsState, HomeInfo, ItemsInfo } from '../../services/models';
import { setShortcuts } from '../../services/settings';
import { itemsCache, searchInfo, setSearchInfo } from '../../services/utilities';
import ExplorerItemsContext from './ExplorerItemsContext';

type Props = { children: ReactNode };

function ExplorerItemsProvider({ children }: Props) {
    const [path, setPath] = useState<string>('/');
    const [loading, setLoading] = useState<boolean>(false);

    const [items, setItems] = useState<ItemsInfo>({ folders: [], files: [] });
    const [home, setHome] = useState<HomeInfo>({
        device: { hostname: 'Loading...', platform: undefined, update: { version: '?.?.?', available: false } },
        clipboard: { type: 'error', content: null },
        drives: [],
        shortcuts: null
    });

    const explore = useCallback(async (newPath: string, pushHistory: boolean = true) => {
        try {
            setLoading(true);

            if (searchInfo !== null && newPath === searchInfo.path) {
                if (searchInfo.filteredItems) {
                    setItems({ ...searchInfo.filteredItems });
                    window.dispatchEvent(new Event('searchpagecache'));
                } else if (searchInfo.deepSearch) {
                    const query = searchInfo.query.toLowerCase().trim();
                    const data: ItemsInfo = await getItems(newPath, query); // Fetch items info with deepSearch query
                    if (data === null) return;
                    setItems(data);
                    setSearchInfo({ ...searchInfo, filteredItems: data });
                }
            } else if (newPath === '/') {
                const data: HomeInfo = await getHome(); // Fetch home info (device, drives, shortcuts, clipboard)
                if (data === null) return;
                if (data.shortcuts) setShortcuts(data.shortcuts);
                setHome(data);
            } else {
                const cachedInfo = itemsCache.get(newPath); // Load the cached items info temporarily if available
                if (cachedInfo) {
                    setItems(cachedInfo);
                    setLoading(false);
                }
                const data: ItemsInfo = await getItems(newPath); // Fetch items info (folder and files) at given path
                if (data === null) return;
                setItems(data);
                itemsCache.set(newPath, data as ItemsInfo);
            }

            if (pushHistory) window.history.pushState({ path: newPath }, '', '?path=' + newPath);
            setPath(newPath);
        }
        catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, []);

    const value: ExplorerItemsState = {
        loading, path,
        home, setHome,
        items, setItems,
        explore
    };

    return (
        <ExplorerItemsContext.Provider value={value}>
            {children}
        </ExplorerItemsContext.Provider>
    );
}

export default ExplorerItemsProvider;