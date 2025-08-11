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

  async function loadItemsInfo(path, label = null) {
    setItemsInfo(await fetchItemsInfo(path));
    deviceInfo.drives.length && setDeviceInfo({ ...deviceInfo, drives: [] });
    if (label) setBreadCrumb([...breadCrumb, { label, path }]);

  }

  function goBackTo(i) {
    const newBreadCrumb = breadCrumb.slice(0, i + 1);
    setBreadCrumb(newBreadCrumb);
    i === -1 ? loadDeviceInfo() : loadItemsInfo(newBreadCrumb[i].path);
  }

  return (
    <div className="app no-select">
      {
        <div>
          <h3 className="hostname">
            <a href="#" onClick={() => goBackTo(-1)}>{deviceInfo.device.hostname}&nbsp; {(breadCrumb.length > 0) && '>>'} &nbsp;</a>
          </h3>
          <h3 className="breadcrumb">
            {breadCrumb.map((b, i) => <a href="#" key={i} onClick={() => goBackTo(i)}>{b.label} {(i < breadCrumb.length - 1) && ' / '}</a>)}
          </h3>
        </div>
      }

      {
        <ul>
          {deviceInfo.drives.map((drive) =>
            <li key={drive.label} onClick={() => loadItemsInfo(drive.path, drive.letter + ':')}>
              <h3 className="itemlabel">{(drive.letter ? drive.letter + ': ' : '') + drive.label}</h3>
              <span className="iteminfo gray">
                Free: {drive.size.free} | Used: {drive.size.used} | Total: {drive.size.total}
              </span>
            </li>
          )}
        </ul>
      }

      {
        <ul>
          {itemsInfo.folders.map((folder) =>
            <li key={folder.name} onClick={() => loadItemsInfo(folder.path, folder.name)}>
              <h3 className="itemlabel">{folder.name}</h3>
              <span className="iteminfo gray">
                Folders: {folder.size[0]} | Files: {folder.size[1]}
              </span>
            </li>
          )}
        </ul>
      }

      {
        <ul>
          {itemsInfo.files.map((file) =>
            <li key={file.name}>
              <h3 className="itemlabel gray">{file.name}</h3>
              <span className="iteminfo gray">
                File Size: {file.size}
              </span>
            </li>
          )}
        </ul>
      }
    </div>
  )
}

export default App
