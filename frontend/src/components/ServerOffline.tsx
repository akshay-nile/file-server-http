function ServerOffline() {
    return (
        <div className='h-[90vh] flex flex-col justify-center items-center text-center text-2xl text-gray-100'>
            <i className='pi pi-globe' style={{ fontSize: '14rem' }} />
            <div className='my-8 font-semibold tracking-wide'>Server is Unreachable</div>
            <span className='text-xs font-extralight leading-3.5'>
                Refresh this page manually <br />
                when the server is online again
            </span>
        </div>
    );
}

export default ServerOffline;