import { Button } from 'primereact/button';
import { SelectButton } from 'primereact/selectbutton';
import { useEffect, useState } from 'react';
import useExplorerItems from '../contexts/ExplorerItems/useExplorerItems';
import type { Settings } from '../services/models';
import { defaultSettings, getSettings, isChanged, setSettings } from '../services/settings';

type Options = { label: string, value: string | boolean };

function UserSettings() {
    const { path, explore } = useExplorerItems();
    const [userSettings, setUserSettings] = useState<Settings>(getSettings());

    useEffect(() => {
        const onSettingsPanelClose = () => setUserSettings(getSettings());
        addEventListener('settingspanelclose', onSettingsPanelClose);
        return () => { removeEventListener('settingspanelclose', onSettingsPanelClose); };
    }, []);

    const sortByOptions: Options[] = [
        { label: 'Name', value: 'name' },
        { label: 'Type', value: 'type' },
        { label: 'Date', value: 'date' },
        { label: 'Size', value: 'size' }
    ];

    const reverseOptions: Options[] = [
        { label: 'Asc', value: false },
        { label: 'Dec', value: true }
    ];

    const showHiddenOptions: Options[] = [
        { label: 'Show', value: true },
        { label: 'Hide', value: false }
    ];

    function save() {
        setSettings(userSettings);
        explore(path, false);
    }

    function reset() {
        setUserSettings(defaultSettings);
        setSettings(defaultSettings);
        explore(path, false);
    }

    return (
        <div className='flex flex-col gap-4 mt-4 mb-2'>
            <div className='flex items-center gap-5'>
                <div>
                    <span className='block ml-0.75 mb-1 text-sm'>Sort Items By</span>
                    <SelectButton value={userSettings.sort_by} className='selectbutton'
                        options={sortByOptions} optionLabel='label' optionValue='value' allowEmpty={false}
                        onChange={e => setUserSettings({ ...userSettings, sort_by: e.value })} />
                </div>
                <div>
                    <span className='block ml-0.75 mb-1 text-sm'>Sort Order</span>
                    <SelectButton value={userSettings.reverse} className='selectbutton'
                        options={reverseOptions} optionLabel='label' optionValue='value' allowEmpty={false}
                        onChange={e => setUserSettings({ ...userSettings, reverse: e.value })} />
                </div>
            </div>
            <div className='flex justify-between items-center'>
                <div>
                    <span className='block ml-0.75 mb-1 text-sm'>Hidden Items</span>
                    <SelectButton value={userSettings.show_hidden} className='selectbutton'
                        options={showHiddenOptions} optionLabel='label' optionValue='value' allowEmpty={false}
                        onChange={e => setUserSettings({ ...userSettings, show_hidden: e.value })} />
                </div>
                <div className='selectbutton'>
                    <span className='block ml-0.25 mb-1 text-sm'>Save or Restore Defaults</span>
                    <Button label='Reset' icon='pi pi-refresh' size='small' style={{ marginRight: '0.6rem' }}
                        disabled={!isChanged(userSettings, defaultSettings)} onClick={reset} />
                    <Button label='Save' icon='pi pi-save' size='small'
                        disabled={!isChanged(userSettings)} onClick={save} />
                </div>
            </div>
        </div>
    );
}

export default UserSettings;