# 📁 MyFileServer v1.0.1

A lightweight file server application to transfer/stream files over network with:

- 🔷 **Frontend**: React-JS with vite and npm (for dependency management)  
- 🔶 **Backend**: Python-Flask with uv (for dependency management)

---

## 📂 Root Project Structure
<br>
MyFileServer/<br>
├── backend/    ← Python-Flask backend<br>
├── frontend/   ← React-JS + Vite frontend<br>
├── scripts/    ← PowerShell scripts<br>
├── .gitignore<br>
└── README.md<br>
<br>

## How to Install on Windows
- Make sure Git, Node and Python are installed
- Clone this repository in Windows PC
- Open PowerShell terminal inside scripts folder
- Run .\installer.ps1 script
- Launch the MyFileServer from Desktop Shortcut
- To Uninstall - Run .\uninstall.ps1 script in PowerShell

## How to Use on Android 
- Make sure Pydroid-3 app is installed in Android device
- Make sure Git and Node is installed on Windows PC 
- Clone this repository in Windows PC
- Open PowerShell terminal inside scripts folder
- Run .\package.ps1 script
- Move the MyFileServer folder to the Android device
- In Pydroid-3 app, open and run server.py from MyFileServer