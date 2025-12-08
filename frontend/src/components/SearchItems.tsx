import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { SelectButton } from 'primereact/selectbutton';
import { useState } from 'react';
import useExplorerItems from '../contexts/ExplorerItems/useExplorerItems';

function SearchItems() {
    const { path, items, setItems, explore } = useExplorerItems();

    const [search, setSearch] = useState<string>('');
    const [deepSearch, setDeepSearch] = useState<boolean>(false);
    const [searching, setSearching] = useState<boolean>(false);

    function doShallowSearch() {
        if (searching) return;
        setSearching(true);
        const query = search.toLowerCase();
        [...items.folders, ...items.files].forEach(item =>
            item.filtered = item.name.toLowerCase().includes(query)
        );
        setItems({ ...items });
        clearSearch();
    }

    function doDeepSearch() {
        if (searching) return;
        setSearching(true);
        explore(path, false, search);
        clearSearch();
    }

    function clearSearch() {
        setSearch('');
        setSearching(false);
        setDeepSearch(false);
    }

    return (
        <div className='flex mt-4 mb-2 mx-1'>
            <div className='flex-3'>
                <span className='block ml-0.5 mb-1 text-sm'>Deep Search</span>
                <SelectButton value={deepSearch} className='selectbutton'
                    options={[{ label: 'On', value: true }, { label: 'Off', value: false }]} optionLabel='label'
                    onChange={e => e.value !== null && setDeepSearch(e.value)} />
            </div>
            <div className='flex-7'>
                <span className='block ml-0.75 mb-1 text-sm'>
                    {deepSearch ? 'Search all the items recursively' : 'Search items on this page only'}
                </span>
                <div className="p-inputgroup">
                    <InputText placeholder="Search Items" style={{ fontSize: '14px' }} spellCheck={false}
                        value={search} onChange={e => setSearch(e.target.value)}
                        onKeyDown={undefined} />
                    <Button icon={`pi ${searching ? 'pi-spin pi-spinner' : 'pi-search'}`}
                        style={{ width: '2.5rem' }}
                        disabled={searching || search.trim().length === 0}
                        onClick={() => deepSearch ? doDeepSearch() : doShallowSearch()} />
                </div>
            </div>
        </div>
    );
}

export default SearchItems;