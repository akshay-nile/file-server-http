import { useState } from 'react';
import type { ItemInfo } from '../services/models';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

type Props = {
    itemToRename: ItemInfo,
    isFileItem: boolean,
    onRename: (name: string) => void,
    onCancel: () => void
};

function RenameItem({ itemToRename, isFileItem, onRename, onCancel }: Props) {
    const [name, setName] = useState<string>(itemToRename.name);

    function isValidName(): boolean {
        if (name.trim().length === 0 || name === itemToRename.name) return false;
        if (isFileItem && !name.includes('.') || !name.trim().split('.').at(-1)) return false;
        if (/[\\/:*?"<>|]/.test(name)) return false;
        if (/[. ]$/.test(name)) return false;
        const reserved = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;
        if (reserved.test(name)) return false;
        return true;
    }

    return (
        <div className='flex flex-col gap-1 items-center'>
            <InputText type='text' placeholder='Item Name' spellCheck={false} autoComplete='off' className='w-full m-0'
                value={name} onChange={e => setName(e.target.value)} />
            <div className='flex gap-5 items-center mt-5'>
                <Button label='Rename' raised size='small' style={{ padding: '0.66rem' }}
                    onClick={() => onRename(name)} disabled={!isValidName()} />
                <Button label='Cancel' raised size='small' severity='danger' style={{ padding: '0.66rem' }}
                    onClick={onCancel} />
            </div>
        </div>
    );
}

export default RenameItem;