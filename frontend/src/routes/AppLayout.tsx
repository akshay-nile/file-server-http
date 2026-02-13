import { ProgressSpinner } from 'primereact/progressspinner';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomPanel from '../components/BottomPanel';
import Breadcrumb from '../components/Breadcrumb';
import Home from '../components/Home';
import Items from '../components/Items';
import TopPanel from '../components/TopPanel';
import useExplorerItems from '../contexts/ExplorerItems/useExplorerItems';
import SelectedItemsProvider from '../contexts/SelectedItems/SelectedItemsProvider';

function AppLayout() {
    const navigate = useNavigate();
    const { loading, path, explore } = useExplorerItems();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlPath = params.get('path');

        (async () => {
            if (urlPath) {
                await explore('/', false);  // Fetch Home info once
                if (urlPath !== '/') await explore(urlPath, false);
            } else await explore('/', true);
        })();

        const onHistory = async (e: PopStateEvent) => {
            e.preventDefault();
            await explore(e.state.path, false);
        };

        window.addEventListener('popstate', onHistory);

        return () => window.removeEventListener('popstate', onHistory);
    }, [explore, navigate]);

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
