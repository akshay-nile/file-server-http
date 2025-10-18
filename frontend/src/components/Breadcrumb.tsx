import { useEffect, useState } from 'react';
import type { Platform } from '../services/models';

type Item = { label: string, path: string };
type Props = { path: string, platform: Platform, explore: (path: string) => void };

function Breadcrumb({ platform, path, explore }: Props) {
    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => {
        if (platform === 'Windows') {
            const labels = path.split('/');
            const items = [];
            for (let i = 0; i < labels.length; i++) {
                const nextPath: string = (i >= 1 ? items[i - 1].path + '/' : '') + labels[i];
                items.push({ label: labels[i], path: nextPath });
            }
            setItems(items);
            return;
        }
        if (platform === 'Android') {
            const root = '/storage/emulated/0';
            const labels = path.replace(root, 'IS:').split('/');
            const items = [{ label: 'IS:', path: root }];
            for (let i = 1; i < labels.length; i++) {
                const nextPath: string = items[i - 1].path + '/' + labels[i];
                items.push({ label: labels[i], path: nextPath });
            }
            setItems(items);
        }
    }, [path, platform]);

    function getItemTempate(item: Item, isLast: boolean) {
        return (
            <span key={item.path}>
                <span className='hover:text-blue-700 cursor-pointer'
                    onClick={() => explore(item.path)}>
                    {item.label}
                </span>
                {!isLast && <span className='mx-1.5'>/</span>}
            </span>
        );
    }

    return (
        <div className='flex flex-wrap items-center border border-gray-300 text-[15px] leading-5 rounded shadow m-3 p-3'>
            {items.map((item, i) => getItemTempate(item, items.length === i + 1))}
        </div>
    );
}

export default Breadcrumb;