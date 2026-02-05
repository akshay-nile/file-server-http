import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useState } from 'react';
import type { ItemInfo } from '../services/models';

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

    function onEnterOrEscapeKey(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            if (isValidName()) onRename(name);
            return;
        }
        if (e.key === 'Escape' || e.key === 'Esc') onCancel();
    }

    return (
        <div className='flex flex-col gap-1 items-center'>
            <InputText type='text' placeholder='Item Name' spellCheck={false} autoComplete='off' autoFocus={true}
                className='w-full m-0' style={{ fontWeight: '500' }}
                value={name} onChange={e => setName(e.target.value)} onKeyDown={onEnterOrEscapeKey} />
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