import { ProgressSpinner } from 'primereact/progressspinner';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useExplorerItems from '../contexts/ExplorerItems/useExplorerItems';
import SelectedItemsProvider from '../contexts/SelectedItems/SelectedItemsProvider';
import type { ErrorDetail } from '../services/models';
import BottomPanel from './BottomPanel';
import Breadcrumb from './Breadcrumb';
import ErrorDetails from './ErrorDetails';
import Home from './Home';
import Items from './Items';
import TopPanel from './TopPanel';

function AppLayout() {
    const navigate = useNavigate();

    const { loading, path, explore } = useExplorerItems();
    const [error, setError] = useState<ErrorDetail | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlPath = params.get('path');

        (async () => {
            if (urlPath) {
                await explore('/', false);  // Fetch Home info once
                if (urlPath !== '/') await explore(urlPath, false);
            } else await explore('/', true);
        })();

        const onError = (event: CustomEvent<ErrorDetail | null>) => {
            setError(event.detail);
            if (event.detail && event.detail.code === 401) navigate('/authentication');
        };
        const onHistory = async (e: PopStateEvent) => {
            e.preventDefault();
            await explore(e.state.path, false);
        };

        window.addEventListener('error', onError);
        window.addEventListener('popstate', onHistory);

        return () => {
            window.removeEventListener('error', onError);
            window.removeEventListener('popstate', onHistory);
        };
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
                        error === null
                            ? loading
                                ? <div className='h-[66%] flex justify-center items-center'>
                                    <ProgressSpinner strokeWidth='0.2rem' animationDuration='0.5s' />
                                </div>
                                : path === '/' ? <Home /> : <Items />
                            : <ErrorDetails error={error} />
                    }
                    <BottomPanel />
                </SelectedItemsProvider>
            </div>
        </div>
    );
}

export default AppLayout;
