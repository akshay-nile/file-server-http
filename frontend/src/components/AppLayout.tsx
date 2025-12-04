import { ProgressSpinner } from 'primereact/progressspinner';
import { useEffect } from 'react';
import useExplorerItems from '../contexts/ExplorerItems/useExplorerItems';
import SelectedItemsProvider from '../contexts/SelectedItems/SelectedItemsProvider';
import Breadcrumb from './Breadcrumb';
import Home from './Home';
import Items from './Items';
import TopPanel from './TopPanel';
import BottomPanel from './BottomPanel';

function AppLayout() {
    const { loading, path, explore } = useExplorerItems();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const path = params.get('path');

        (async () => {
            if (path) {
                await explore('/', false);
                if (path !== '/') await explore(path, false);
            } else await explore('/', true);
        })();

        const onHistory = async (e: PopStateEvent) => {
            e.preventDefault();
            await explore(e.state.path, false);
        };

        window.addEventListener('popstate', onHistory);
        return () => window.removeEventListener('popstate', onHistory);
    }, [explore]);

    return (
        <div className="w-full flex justify-center">
            <div className="bg-gray-50 min-h-screen w-full md:w-[60%] lg:w-[34%] rounded-md">
                <div className='sticky top-0 bg-gray-50 z-10'>
                    <TopPanel />
                    {path !== '/' && <Breadcrumb />}
                </div>
                <SelectedItemsProvider>
                    {
                        loading
                            ? <div className='h-[66%] flex justify-center items-center'>
                                <ProgressSpinner strokeWidth='0.2rem' animationDuration='0.5s' />
                            </div>
                            : path === '/' ? <Home /> : <Items />
                    }
                    <BottomPanel />
                </SelectedItemsProvider>
            </div>
        </div>
    );
}

export default AppLayout;
