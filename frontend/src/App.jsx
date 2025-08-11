import { useState, useEffect } from "react";
import { fetchItemsInfo, fetchDeviceInfo } from "./services/apiService";


function App() {
  const [deviceInfo, setDeviceInfo] = useState({ device: { hostname: null, platform: null }, drives: [] });
  const [itemsInfo, setItemsInfo] = useState({ folders: [], files: [] });
  const [breadCrumb, setBreadCrumb] = useState([]);

  useEffect(() => {
    loadDeviceInfo();
  }, []);

  async function loadDeviceInfo() {
    setDeviceInfo(await fetchDeviceInfo());
    setItemsInfo({ folders: [], files: [] });
    setBreadCrumb([]);
  }

  async function loadItemsInfo(path, itemName = null) {
    setItemsInfo(await fetchItemsInfo(path));
    itemName && setBreadCrumb([...breadCrumb, itemName]);
    setDeviceInfo({ ...deviceInfo, drives: [] });
  }

  function goBackTo(i) {
    const newBreadCrumb = breadCrumb.slice(0, i + 1);
    setBreadCrumb(newBreadCrumb);
    i === -1 ? loadDeviceInfo() : loadItemsInfo(newBreadCrumb.join('/'));
  }

  return (
    <div className="app">
      {
        <div>
          <h3 className="hostname">
            <a href="#" onClick={() => goBackTo(-1)}>{deviceInfo.device.hostname} {(breadCrumb.length > 0) && ' >> '}</a>
          </h3>
          <h3 className="breadcrumb">
            {breadCrumb.map((b, i) => <a href="#" key={i} onClick={() => goBackTo(i)}>{b} {(i < breadCrumb.length - 1) && ' / '}</a>)}
          </h3>
        </div>
      }

      {
        <ul>
          {deviceInfo.drives.map((drive) =>
            <li key={drive.label} onClick={() => loadItemsInfo(drive.path, drive.path)}>
              <h3 className="itemlabel">{drive.label}</h3>
              <span className="iteminfo">
                Free: {drive.free} | Available: {drive.used} | Total: {drive.total}
              </span>
            </li>
          )}
        </ul>
      }

      {
        <ul>
          {itemsInfo.folders.map((folder) =>
            <li key={folder.folder_name} onClick={() => loadItemsInfo(folder.folder_path, folder.folder_name)}>
              <h3 className="itemlabel">{folder.folder_name}</h3>
              <span className="iteminfo">
                Folders: {folder.folder_count} | Files: {folder.file_count}
              </span>
            </li>
          )}
        </ul>
      }

      {
        <ul>
          {itemsInfo.files.map((file) =>
            <li key={file.file_name} style={{ cursor: "pointer" }}>
              <h3 style={{ marginBottom: '5px', marginTop: '1em' }}>{file.file_name}</h3>
              <span className="iteminfo">
                File Size: {file.file_size}
              </span>
            </li>
          )}
        </ul>
      }
    </div>
  )
}

export default App
