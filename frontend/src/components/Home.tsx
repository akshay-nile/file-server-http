import type { DriveInfo } from '../services/models';
import DriveItem from './DriveItem';

type Props = { drives: Array<DriveInfo>, explore: (path: string) => void };

function Home({ drives, explore }: Props) {
    return <>
        {
            drives.map((drive, i) =>
                <div key={drive.path} className='mx-2'>
                    {i === 0 && <hr className='text-gray-300 m-1' />}
                    <DriveItem drive={drive} explore={explore} />
                    <hr className='text-gray-300 m-1' />
                </div>
            )
        }
    </>;
}

export default Home;