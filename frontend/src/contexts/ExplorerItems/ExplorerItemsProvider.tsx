import { useCallback, useState, type ReactNode } from 'react';
import type { ExplorerItemsState, HomeInfo, ItemsInfo } from '../../services/models';
import ExplorerItemsContext from './ExplorerItemsContext';
import { getHome, getItems } from '../../services/api';
import { setShortcuts } from '../../services/settings';
import { searchInfo, setSearchInfo } from '../../services/utilities';

type Props = { children: ReactNode };

function ExplorerItemsProvider({ children }: Props) {
    const [loading, setLoading] = useState<boolean>(false);
    const [path, setPath] = useState<string>('/');

    const [home, setHome] = useState<HomeInfo>({
        device: { hostname: 'Loading...', platform: undefined, update: { version: '?.?.?', available: false } },
        clipboard: { type: 'error', content: null },
        drives: [],
        shortcuts: null
    });
    const [items, setItems] = useState<ItemsInfo>({ folders: [], files: [] });

    const explore = useCallback(async (newPath: string, pushHistory: boolean = true) => {
        try {
            setLoading(true);

            if (searchInfo !== null && newPath === searchInfo.path) {
                if (searchInfo.filteredItems) {
                    setItems({ ...searchInfo.filteredItems });
                    window.dispatchEvent(new Event('searchpagecache'));
                } else if (searchInfo.deepSearch) {
                    const query = searchInfo.query.toLowerCase().trim();
                    const filteredItems: ItemsInfo = await getItems(newPath, query); // Fetch items info with deepSearch query
                    setItems(filteredItems);
                    setSearchInfo({ ...searchInfo, filteredItems });
                }
            } else if (newPath === '/') {
                const data: HomeInfo = await getHome(); // Fetch home info (device, drives, shortcuts, clipboard)
                if (data.shortcuts) setShortcuts(data.shortcuts);
                setHome(data);
            } else {
                const data: ItemsInfo = await getItems(newPath); // Fetch items info (folder and files) at given path
                setItems(data);
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