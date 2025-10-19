import useExplorerItems from '../contexts/ExplorerItems/useExplorerItems';
import DriveItem from './DriveItem';

function Home() {
    const { home } = useExplorerItems();

    return <>
        {
            home.drives.map((drive, i) =>
                <div key={drive.path} className='mx-2'>
                    {i === 0 && <hr className='text-gray-300 m-1' />}
                    <DriveItem drive={drive} />
                    <hr className='text-gray-300 m-1' />
                </div>
            )
        }
    </>;
}

export default Home;