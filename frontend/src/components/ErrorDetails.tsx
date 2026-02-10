import type { ErrorDetail } from '../services/models';

type Props = { error: ErrorDetail };

function ErrorDetails({ error }: Props) {
    return (
        <div className='h-[55%] flex flex-col justify-center items-center text-center text-gray-600 m-4'>
            <div className='mb-2 font-bold tracking-wider text-4xl'>{error.code}</div>
            <div className='mb-4 font-semibold tracking-wide text-xl'>{error.status.toUpperCase()}</div>
            <span className='mt-8 text-sm font-mono'>{error.message}</span>
        </div>
    );
}

export default ErrorDetails;