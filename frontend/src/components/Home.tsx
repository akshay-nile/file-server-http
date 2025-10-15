import type { DriveInfo } from '../services/models';
import DriveItem from './DriveItem';

type Props = { drives: Array<DriveInfo>, explore: (path: string) => void };

function Home({ drives, explore }: Props) {
    return <>
        {
            drives.map(drive => <DriveItem
                key={drive.path}
                drive={drive}
                explore={explore} />)
        }
    </>;
}

export default Home;