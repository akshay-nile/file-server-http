import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticate } from '../services/api';
import { toast } from '../services/utilities';

function Authentication() {
    const navigate = useNavigate();

    const [token, setToken] = useState('');
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        (async () => {
            const data = await authenticate();
            if (data === null) return;
            if (data.status === 'generated') setShowHelp(true);
        })();
    }, []);

    async function verify() {
        const response = await authenticate(token);
        if (response.status === 'verified') navigate('/');
        else {
            setToken('');
            toast.show({
                severity: 'warn',
                summary: 'Invalid Token',
                detail: 'Please enter the valid server-generated token.'
            });
        }
    }

    function onEnterOrEscapeKey(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') { verify(); return; }
        if (e.key === 'Escape' || e.key === 'Esc') setToken('');
    }

    return (
        <div className='w-full flex justify-center'>
            <div className='bg-gray-50 min-h-screen w-full md:w-[60%] lg:w-[34%]'>
                <div className='h-[90%] flex flex-col justify-center items-center gap-2'>
                    <label htmlFor='token' className='mb-4 font-semibold text-center text-3xl text-gray-800'>
                        Token Required
                    </label>

                    <img src='/public/icons/token-required.png' width='150px' className='mt-2 mb-4' />

                    <InputText id='token' aria-describedby='token-info' required
                        spellCheck={false} autoCorrect='off' autoCapitalize='off'
                        value={token} autoFocus onKeyDown={onEnterOrEscapeKey}
                        onChange={e => setToken(e.target.value.toUpperCase())}
                        style={{
                            border: '1px solid blue', textAlign: 'center',
                            fontSize: 'larger', fontWeight: 'bold', letterSpacing: '0.25rem',
                            padding: '0.5rem', marginTop: '1rem', width: '13ch'
                        }} />

                    <small id='token-info' className='text-sm font-light'>
                        {showHelp
                            ? 'Enter the token shown in the server logs'
                            : 'Generating unique token... Please wait...'}
                    </small>

                    <Button label='Verify' style={{ marginTop: '1rem' }}
                        disabled={token.trim().length === 0 || !showHelp}
                        onClick={verify} />
                </div>
            </div>
        </div>
    );
}

export default Authentication;