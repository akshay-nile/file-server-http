import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useEffect, useState } from 'react';
import { authenticate } from '../services/api';

function Authentication() {
    const [token, setToken] = useState('');
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        (async () => {
            const response = await authenticate();
            if (response.status === 'generated') setShowHelp(true);
        })();
    }, []);

    async function verify() {
        const response = await authenticate(token);
        if (response.status === 'verified') {
            localStorage.setItem('token', token);
            window.dispatchEvent(new Event('authentication'));
        } else setToken('');
    }

    function onEnterOrEscapeKey(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') { verify(); return; }
        if (e.key === 'Escape' || e.key === 'Esc') setToken('');
    }

    return (
        <div className='w-full flex justify-center'>
            <div className='bg-gray-50 min-h-screen w-full md:w-[60%] lg:w-[34%]'>
                <div className='h-[80%] flex flex-col justify-center items-center gap-2'>
                    <label htmlFor='token' className='text-xl font-medium'>
                        Token Required
                    </label>
                    <InputText id='token' aria-describedby='token-info' required
                        spellCheck={false} autoCorrect='off' autoCapitalize='off'
                        value={token} autoFocus onKeyDown={onEnterOrEscapeKey}
                        onChange={e => setToken(e.target.value.toUpperCase())}
                        style={{
                            border: '1px solid blue', textAlign: 'center',
                            fontSize: 'larger', fontWeight: 'bold', letterSpacing: '0.25rem',
                            padding: '0.5rem', width: '13ch'
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