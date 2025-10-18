import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useEffect, useState } from 'react';
import { authenticate } from '../services/api';

function Authentication() {
    const [verificationCode, setVerificationCode] = useState('');
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        (async () => {
            const response = await authenticate();
            if (response.status === 'generated') setShowHelp(true);
        })();
    }, []);

    async function verify() {
        const response = await authenticate(verificationCode);
        if (response.status === 'verified') {
            localStorage.setItem('verification-code', verificationCode);
            window.dispatchEvent(new Event('authentication'));
        } else setVerificationCode('');
    }

    function onEnterOrEscapeKey(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') { verify(); return; }
        if (e.key === 'Escape' || e.key === 'Esc') setVerificationCode('');
    }

    return (
        <div className='w-full flex justify-center'>
            <div className='bg-gray-50 min-h-screen w-full md:w-[60%] lg:w-[34%]'>
                <div className='h-[80%] flex flex-col justify-center items-center gap-2'>
                    <label htmlFor='verification-code' className='text-xl font-medium'>
                        Verification Code
                    </label>
                    <InputText id='verification-code' aria-describedby='verification-code-info'
                        spellCheck={false} autoCorrect='off' autoCapitalize='off'
                        value={verificationCode} autoFocus onKeyDown={onEnterOrEscapeKey}
                        onChange={e => setVerificationCode(e.target.value.toUpperCase())}
                        style={{
                            border: '1px solid blue', textAlign: 'center',
                            fontSize: 'larger', fontWeight: 'bold', letterSpacing: '0.25rem',
                            padding: '0.5rem', width: '13ch'
                        }} />
                    <small id='verification-code-info' className='text-sm font-light'>
                        {showHelp
                            ? 'Enter the verification code shown in the server logs'
                            : 'Generating verification code... Please wait...'}
                    </small>
                    <Button label='Verify'
                        disabled={verificationCode.trim().length === 0 || !showHelp}
                        onClick={verify}
                        style={{ marginTop: '1rem' }} />
                </div>
            </div>
        </div>
    );
}

export default Authentication;