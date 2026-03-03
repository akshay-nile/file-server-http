# 📁 MyFileServer v1.7.12

A lightweight file server application to transfer/stream files over network with:

- 🔷 **Frontend**:  TS-React with vite and npm  
- 🔶 **Backend**:   Python-Flask with uv


## How to Install on Windows PC
- Copy and run the following command in the PowerShell terminal
- Now you can launch the MyFileServer from its desktop shortcut
- Can be safely uninstalled from Windows (Add or Remove Programs) settings
```
Start-Process powershell.exe -Verb RunAs -ArgumentList "-ExecutionPolicy Bypass -c irm https://github.com/akshay-nile/file-server-http/raw/master/scripts/install.ps1 | iex"
```


## How to Setup and Use on Android
- Make sure Pydroid-3 app is installed in Android device
- Copy and run the following command in Pydroid-3 terminal
- Open and run "Internal Storage/Documents/Pydroid 3/MyFileServer/server.py" 
```
curl -sSL https://github.com/akshay-nile/file-server-http/raw/master/scripts/install.sh | sh
```


## Backend Architecture (Mermaid Diagram)

```mermaid
graph LR
    server[server.py]

    subgraph services
        init[#95;#95;init#95;#95;.py]
        explorer[explorer.py]
        authenticator[authenticator.py]
        validator[validator.py]
        network[network.py]
        environment[environment.py]
        thumbnails[thumbnails.py]
        utilities[utilities.py]
    end

    server --> init
    server --> explorer
    server --> authenticator
    server --> thumbnails
    server --> environment
    server --> network
    server --> validator
    server --> utilities

    init --> environment
    init --> utilities

    authenticator --> environment

    explorer --> environment
    explorer --> thumbnails
    explorer --> utilities

    thumbnails --> environment

    network --> environment
    network --> explorer
    network --> utilities

    validator --> utilities

    utilities --> environment
```


## Frontend Architecture (Mermaid Diagram)

```mermaid
graph LR
    App

    subgraph components
        Layout
        Application
        Authentication
        BottomPanel
        Breadcrumb
        DriveItem
        EmptyFolder
        ErrorDetails
        FileItem
        FolderItem
        Home
        ItemDetails
        Items
        MusicPlayer
        RenameItem
        SearchItems
        TopPanel
        UploadFiles
        UserSettings
    end

    App --> Application
    App --> Authentication
    App --> MusicPlayer
    App --> ErrorDetails

    Application --> Layout
    Application --> TopPanel
    Application --> Home
    Application --> Items
    Application --> BottomPanel
    Application --> Breadcrumb

    ErrorDetails --> Layout

    Authentication --> Layout
    
    MusicPlayer --> Layout

    Home --> DriveItem
    Home --> FileItem
    Home --> FolderItem

    Items --> EmptyFolder
    Items --> FileItem
    Items --> FolderItem

    TopPanel --> UploadFiles
    TopPanel --> SearchItems
    TopPanel --> UserSettings

    BottomPanel --> ItemDetails
    BottomPanel --> RenameItem
```