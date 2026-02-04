import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { SelectButton } from 'primereact/selectbutton';
import { useCallback, useEffect, useRef, useState } from 'react';
import useExplorerItems from '../contexts/ExplorerItems/useExplorerItems';
import { clearSearchInfo, searchInfo, setSearchInfo } from '../services/utilities';

function SearchItems() {
    const { path, items, setItems, explore } = useExplorerItems();
    const pathRef = useRef<string>(null);

    const [search, setSearch] = useState<string>('');
    const [deepSearch, setDeepSearch] = useState<boolean>(false);
    const [status, setStatus] = useState<'none' | 'searching' | 'searched'>('none');

    useEffect(() => {
        pathRef.current = path;
        if (searchInfo !== null && path !== searchInfo.path) {
            setSearch('');
            setDeepSearch(false);
            setStatus('none');
        }
    }, [path]);

    async function performSearch() {
        if (status === 'searching') return;
        setStatus('searching');
        const query = search.toLowerCase().trim();
        const originalItems = searchInfo ? searchInfo.originalItems : items;
        if (!deepSearch) {
            const filteredItems = {
                folders: originalItems.folders.filter(folder => folder.name.toLowerCase().includes(query)),
                files: originalItems.files.filter(file => file.name.toLowerCase().includes(query))
            };
            setItems(filteredItems);
            setSearchInfo({ query: search, deepSearch, path, originalItems, filteredItems });
        } else {
            setSearchInfo({ query: search, deepSearch, path, originalItems, filteredItems: null });
            await explore(path);
        }
        setStatus('searched');
    }

    const clearSearch = useCallback(async () => {
        setSearch('');
        setDeepSearch(false);
        setStatus('none');
        clearSearchInfo();
        if (status !== 'none' && pathRef.current) {
            await explore(pathRef.current, false);
        }
    }, [status, explore]);

    function onEnterOrEscapeKey(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            if (search.trim().length && status === 'none') performSearch();
            return;
        }
        if (e.key === 'Escape' || e.key === 'Esc') clearSearch();
    };

    useEffect(() => {
        const onSearchPage = () => {
            if (searchInfo === null) return;
            setSearch(searchInfo.query);
            setDeepSearch(searchInfo.deepSearch);
            setStatus('searched');
        };
        addEventListener('onsearchpagecache', onSearchPage);
        addEventListener('onsearchpanelclose', clearSearch);
        return () => {
            removeEventListener('onsearchpagecache', onSearchPage);
            removeEventListener('onsearchpanelclose', clearSearch);
        };
    }, [clearSearch]);

    return (
        <div className='flex mt-4 mb-2 mx-1'>
            <div className='flex-3'>
                <span className='block ml-0.5 mb-1 text-sm'>Deep Search</span>
                <SelectButton value={deepSearch} className='selectbutton' allowEmpty={false}
                    options={[{ label: 'On', value: true }, { label: 'Off', value: false }]} optionLabel='label' optionValue='value'
                    onChange={e => { setDeepSearch(e.value); setStatus('none'); }} />
            </div>
            <div className='flex-7'>
                <span className='block ml-0.75 mb-1 text-sm'>
                    {deepSearch ? 'Search all the items recursively' : 'Search items on this page only'}
                </span>
                <div className="p-inputgroup">
                    <InputText placeholder="Search Items" style={{ fontSize: '14px' }} spellCheck={false} autoComplete='off'
                        value={search} onChange={e => { setSearch(e.target.value); setStatus('none'); }}
                        onKeyDown={onEnterOrEscapeKey} />
                    <Button icon={`pi ${status === 'searching' ? 'pi-spin pi-spinner' : status === 'none' ? 'pi-search' : 'pi-times'}`}
                        style={{ width: '2.5rem' }}
                        disabled={status === 'searching' || search.trim().length === 0}
                        onClick={() => status === 'none' ? performSearch() : clearSearch()} />
                </div>
            </div>
        </div>
    );
}

export default SearchItems;