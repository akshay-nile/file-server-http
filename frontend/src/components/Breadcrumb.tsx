import { useEffect, useState } from 'react';
import useExplorerItems from '../contexts/ExplorerItems/useExplorerItems';

type BreadcrumbItem = { label: string, path: string };

function Breadcrumb() {
    const { path, home, explore } = useExplorerItems();
    const [items, setItems] = useState<BreadcrumbItem[]>([]);

    useEffect(() => {
        const items: BreadcrumbItem[] = [];
        let labels: string[] = [];

        if (home.device.platform === 'Android') {
            const root = '/storage/emulated/0';
            labels = path.replace(root, 'IS:').split('/');
            items.push({ label: 'IS:', path: root });
        }

        if (home.device.platform === 'Windows') {
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
    }, [path, home.device.platform]);

    function getItemTempate(item: BreadcrumbItem, isLast: boolean) {
        return (
            <span key={item.path}>
                <span className='hover:text-blue-700 cursor-pointer' onClick={() => explore(item.path, true)}>
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