import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ListBox, type ListBoxChangeEvent } from 'primereact/listbox';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useEffect, useState } from 'react';
import type { FileInfo } from '../services/models';
import { getMusicPlayerData } from '../services/settings';
import { formatSize } from '../services/utilities';

function MusicPlayer() {
    const [songs, setSongs] = useState<FileInfo[]>([]);
    const [index, setIndex] = useState<number>(-1);
    const [playing, setPlaying] = useState<boolean>(false);
    const [showList, setShowList] = useState<boolean>(false);

    useEffect(() => {
        const loadMusicData = () => {
            const data = getMusicPlayerData();
            if (!data) return;
            setSongs(data.songs);
            setIndex(data.index);
        };
        loadMusicData();
        const channel = new BroadcastChannel('music_channel');
        channel.onmessage = loadMusicData;
        return () => channel.close();
    }, []);

    function getItemTemplate(song: FileInfo) {
        return (
            <div className='flex items-center gap-2'>
                <img src={song.thumbnail ?? '/icons/album.png'} width='40px' height='40px' className='shadow rounded-[4px]' />
                <span className='font-medium text-[15px] leading-5 min-w-0 break-words'>
                    {song.name.substring(0, song.name.lastIndexOf('.'))}
                </span>
            </div>
        );
    }

    function playNext() {
        if (index < songs.length - 1) setIndex(index + 1);
        setPlaying(false);
    }

    function playPrev() {
        if (index > 0) setIndex(index - 1);
        setPlaying(false);
    }

    return (
        <div className="w-full flex justify-center text-gray-50">
            <div className="min-h-[92vh] w-[92%] md:w-[60%] lg:w-[34%] rounded-md">
                {
                    (index === -1 || songs.length === 0)
                        ? <div className='h-[90%] flex justify-center items-center'>
                            <ProgressSpinner strokeWidth='0.2rem' animationDuration='0.5s' />
                        </div>
                        : <div className='h-full flex flex-col gap-4 justify-center'>
                            <div className='flex items-center gap-4'>
                                <img width='70px' height='70px' src={songs[index].thumbnail ?? '/icons/album.png'}
                                    className={`shadow ${playing ? 'rounded-full animate-[spin_3s_linear_infinite]' : 'rounded-[8px]'}`} />

                                <div className='flex flex-col gap-1 group cursor-pointer'>
                                    <span className='text-lg leading-5.5 font-semibold min-w-0 break-words'>
                                        {songs[index].name.substring(0, songs[index].name.lastIndexOf('.'))}
                                    </span>
                                    <div className='flex text-[13px] tracking-wider ml-0.25'>
                                        <span>Size {formatSize(songs[index].size)}</span>
                                    </div>
                                </div>
                            </div>

                            <audio autoPlay controls className='w-full h-12'
                                src={`/open?path=${encodeURIComponent(songs[index].path)}&stream=true`}
                                onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
                                onEnded={playNext} />

                            <div className='flex justify-between items-center w-full h-12 gap-2'>
                                <Button label='Prev' icon='pi pi-arrow-left' size='small' severity='secondary' raised
                                    disabled={index <= 0}
                                    onClick={playPrev} />

                                <Button label='Playlist' size='small' severity='secondary' raised
                                    icon={showList ? 'pi pi-spin pi-spinner' : 'pi pi-list'}
                                    disabled={showList}
                                    onClick={() => setShowList(!showList)} />

                                <Button label='Next' icon="pi pi-arrow-right" iconPos='right' size='small' severity='secondary' raised
                                    disabled={index >= songs.length - 1}
                                    onClick={playNext} />
                            </div>

                            <Dialog header={'Playlist (' + songs.length + ' Songs)'}
                                pt={{ root: { className: 'w-[95%] md:w-[60%] lg:w-[34%]' } }}
                                contentStyle={{ padding: '0px', margin: '0px' }}
                                visible={showList} onHide={() => setShowList(false)}>

                                <ListBox filter optionLabel='name' optionValue='path' filterBy='name'
                                    itemTemplate={(song: FileInfo) => getItemTemplate(song)}
                                    options={songs} value={songs[index].path}
                                    onChange={(e: ListBoxChangeEvent) => setIndex(songs.findIndex(s => s.path === e.value))} />
                            </Dialog>
                        </div>
                }
            </div>
        </div>
    );
}

export default MusicPlayer;