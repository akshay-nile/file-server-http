import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import type { ErrorDetail } from '../services/models';

function ErrorDetails() {
    const error: ErrorDetail = useLocation().state;

    return (
        <Layout theme="dark">
            <div className="h-full flex flex-col justify-center items-center">
                <div className="mb-2 font-bold tracking-wider text-4xl">{error.code}</div>
                <div className="mb-4 font-semibold tracking-wide text-xl">{error.status.toUpperCase()}</div>
                {error.message && <span className="mx-2 mt-8 text-center text-sm font-mono">{error.message}</span>}
            </div>
        </Layout>
    );
}

export default ErrorDetails;