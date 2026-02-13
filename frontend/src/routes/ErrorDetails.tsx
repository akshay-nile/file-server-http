import { useLocation } from 'react-router-dom';
import type { ErrorDetail } from '../services/models';

function ErrorDetails() {
    const error: ErrorDetail = useLocation().state;

    return (
        <div className='h-[85vh] flex flex-col justify-center items-center text-center text-gray-100 m-4'>
            <div className='mb-2 font-bold tracking-wider text-4xl'>{error.code}</div>
            <div className='mb-4 font-semibold tracking-wide text-xl'>{error.status.toUpperCase()}</div>
            {error.message && <span className='mt-8 text-sm font-mono'>{error.message}</span>}
        </div>
    );
}

export default ErrorDetails;