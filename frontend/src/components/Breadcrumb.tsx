import { useEffect, useState } from 'react';
import type { Platform } from '../services/models';

type Item = { label: string, path: string };
type Props = { path: string, platform: Platform, explore: (path: string) => void };

function Breadcrumb({ platform, path, explore }: Props) {
    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => {
        const items: Item[] = [];
        let labels: string[] = [];

        if (platform === 'Android') {
            const root = '/storage/emulated/0';
            labels = path.replace(root, 'IS:').split('/');
            items.push({ label: 'IS:', path: root });
        }

        if (platform === 'Windows') {
            labels = path.split('/');
            items.push({ label: labels[0], path: labels[0] + '/' });
        }

        for (let i = 1; i < labels.length; i++) {
            if (labels[i].trim().length === 0) continue;
            const seperator = items[i - 1].path.endsWith('/') ? '' : '/';
            const nextPath: string = items[i - 1].path + seperator + labels[i];
            items.push({ label: labels[i], path: nextPath });
        }

        setItems(items);
    }, [path, platform]);

    function getItemTempate(item: Item, isLast: boolean) {
        return (
            <span key={item.path}>
                <span className='hover:text-blue-700 cursor-pointer' onClick={() => explore(item.path)}>
                    {item.label}
                </span>
                {!isLast && <span className='mx-1.5'>/</span>}
            </span>
        );
    }

    return (
        <div className='flex flex-wrap items-center text-[15px] leading-5 border border-gray-300 rounded shadow m-3 p-3'>
            {items.map((item, i) => getItemTempate(item, items.length === i + 1))}
        </div>
    );
}

export default Breadcrumb;