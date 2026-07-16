import { type ReactNode } from 'react';

type Props = { children: ReactNode, theme: 'dark' | 'light' };

function Layout({ children, theme }: Props) {
    const colors = theme === 'light' ? 'bg-neutral-50 text-neutral-800' : 'bg-neutral-800 text-neutral-50';

    return (
        <div className="w-full flex justify-center">
            <div className={`w-full min-h-dvh md:w-[60%] lg:w-[34%] transition-all duration-300 ease-in-out rounded-lg ${colors}`}>
                {children}
            </div>
        </div>
    );
}

export default Layout;