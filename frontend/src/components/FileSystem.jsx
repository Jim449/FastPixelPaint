import React, { useState, useEffect } from "react"
import { authStore } from "src/store/authStore"

export default function FileSystem() {
    const token = authStore();
    const folderId = authStore();
    const rootId = authStore();
    const setCurrentFolder = authStore((state) => state.setFolder);
    const [activeFolder, setActiveFolder] = useState([]);
    const [folders, setFolders] = useState([]);
    const [images, setImages] = useState([]);
    const [palettes, setPalettes] = useState([]);
    const [nameField, setNameField] = useState(false);

    async function openFolder(token, id) {
        try {
            response = await fetch(`http://localhost:8000/v1/folder/${id}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status == 200) {
                const data = await response.json();
                setActiveFolder(data.current_folder);
                setFolders(data.folders);
                setImages(data.images);
                setPalettes(data.palettes);
                setCurrentFolder(data.current_folder.id);
            }
        }
        catch { }
    }

    async function createFolder(token, parent, name) {
        setNameField(false);

        if (!name) return;

        try {
            response = await fetch(`http://localhost:8000/v1/folder/${name}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(parent)
            });
            if (response.status == 200) {
                const data = await response.json();
                setFolders([...folders, data])
            }
        }
        catch { }
    }

    useEffect(() => {
        if (folderId !== null) {
            openFolder(token, folderId);
        }
        else if (rootId !== null) {
            openFolder(token, rootId);
        }
    }, []);

    return <div className="background-gray-50">
        <button
            onClick={(event) => setNameField(true)}>New folder
        </button>
        {nameField && <input
            type="text"
            placeholder="This should get focus if user clicks New folder"
            autoFocus
            onBlur={(event) => createFolder(token, folderId, event.target.value)}>
        </input>}
        <table>
            <thead>
                <tr className="background-gray-100 border-b-1 border-gray-300">
                    <th>Type</th>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Updated</th>
                </tr>
            </thead>
            <tbody>
                {folders.map((item) => <tr className="bg-gray-50 focus:bg-white">
                    <td>Folder</td>
                    <td>{item.name}</td>
                    <td></td>
                    <td></td>
                </tr>)}
                {images.map((item) => <tr className="bg-gray-50 focus:bg-white">
                    <td>Image</td>
                    <td>{item.name}</td>
                    <td>{item.width}x{item.height}</td>
                    <td>{item.updated}</td>
                </tr>)}
                {palettes.map((item) => <tr className="bg-gray-50 focus:bg-white">
                    <td>Palette</td>
                    <td>{item.name}</td>
                    <td>(add size later)</td>
                    <td>{item.updated}</td>
                </tr>)}
            </tbody>
        </table>
    </div>
}