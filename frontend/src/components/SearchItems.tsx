import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { SelectButton } from 'primereact/selectbutton';
import { useState } from 'react';

function SearchItems() {
    const [search, setSearch] = useState<string>('');
    const [deepSearch, setDeepSearch] = useState<boolean>(false);

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
                    <InputText placeholder="Search Items" style={{ fontSize: '14px' }}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={undefined} />
                    <Button icon={'pi pi-search'} style={{ width: '2.5rem' }}
                        disabled={false}
                        onClick={undefined} />
                </div>
            </div>
        </div>
    );
}

export default SearchItems;