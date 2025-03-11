import React, { useState, useEffect } from "react"
import { authStore } from "src/store/authStore"

export default function FileSystem({ saveMode, onSave, onCancel }) {
    const token = authStore((state) => state.token);
    const folderId = authStore((state) => state.folderId);
    const rootId = authStore((state) => state.rootId);
    const setCurrentFolder = authStore((state) => state.setFolder);
    const [activeFolder, setActiveFolder] = useState([]);
    const [folders, setFolders] = useState([]);
    const [images, setImages] = useState([]);
    const [palettes, setPalettes] = useState([]);
    const [nameField, setNameField] = useState(false);
    const [saveName, setSaveName] = useState("");
    const [saveError, setSaveError] = useState("");
    const [path, setPath] = useState([]);

    async function openFolder(token, id) {
        // Opens the folder with the given id. Enter null for root folder
        let url = (id === null) ? `http://localhost:8000/v1/root` : `http://localhost:8000/v1/folder/${id}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 200) {
                const data = await response.json();
                setActiveFolder(data.current_folder);
                setFolders(data.folders);
                setImages(data.images);
                setPalettes(data.palettes);
                setCurrentFolder(data.current_folder.id);
                setPathList(data.current_folder.path);
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    function setPathList(path) {
        // Splits a path into an array of folders, containing paths and names

        let splitPath = path.split("/");
        let listPath = [];
        let item;

        for (let end = 1; end < splitPath.length; end++) {
            item = {
                path: splitPath[0],
                name: splitPath[end]
            };
            for (let start = 1; start <= end; start++) {
                item.path += "/" + splitPath[start];
            }
            listPath.push(item);
        }
        setPath(listPath);
    }

    function handleSave(event) {
        let name = event.target.value;

        if (name.contains("/")) {
            setSaveError("Invalid save name.");
        }
        else {
            onSave(name, activeFolder);
        }
    }

    async function createFolder(token, parent, name) {
        setNameField(false);

        if (!name) return;

        try {
            const response = await fetch(`http://localhost:8000/v1/folder/${name}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(parent)
            });
            if (response.status == 201) {
                const data = await response.json();
                console.log(data);
                setFolders([...folders, data])
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (folderId !== null) {
            openFolder(token, folderId);
        }
        else if (rootId !== null) {
            openFolder(token, rootId);
        }
        else {
            openFolder(token, null);
        }
    }, []);

    return <div className="flex flex-col bg-gray-50">
        {activeFolder && <h2 className="m-2 text-xl">{activeFolder.name}</h2>}
        {path && <div className="ml-2 mb-4">
            {path.map((item) =>
                <span className="text-sm" key={item.path}> / <button
                    className="underline hover:text-blue-600 cursor-pointer">{item.name}
                </button></span>)}
        </div>}
        <div className="flex">
            <button
                className="m-2 px-2 py-1 w-32 bg-gray-100 border border-gray-300 cursor-pointer text-sm"
                onClick={(event) => setNameField(true)}>New folder
            </button>
            {nameField && <input
                type="text"
                className="m-2 pl-2 text-sm"
                placeholder="Enter folder name"
                autoFocus
                onBlur={(event) => createFolder(token, activeFolder, event.target.value)}>
            </input>}
        </div>
        <table className="m-2 overflow-y-scroll">
            <thead>
                <tr className="flex bg-gray-100 border-b-1 border-gray-300">
                    <th className="m-2 w-20">Type</th>
                    <th className="m-2 w-48">Name</th>
                    <th className="m-2 w-20">Size</th>
                    <th className="m-2 w-20">Updated</th>
                </tr>
            </thead>
            <tbody>
                {folders.map((item) => <tr
                    className="flex border-b-1 border-gray-200 focus:bg-white"
                    key={"row-" + item.path}>
                    <td className="m-2 w-20">Folder</td>
                    <td className="m-2 w-48 overflow-ellipsis">{item.name}</td>
                    <td className="m-2 w-20"></td>
                    <td className="m-2 w-20"></td>
                </tr>)}
                {images.map((item) => <tr
                    className="flex gap-10 border-b-1 border-gray-200 focus:bg-white"
                    key={"image-" + item.name}>
                    <td className="m-2 w-20">Image</td>
                    <td className="m-2 w-48 overflow-ellipsis">{item.name}</td>
                    <td className="m-2 w-20">{item.width}x{item.height}</td>
                    <td className="m-2 w-20">{item.updated}</td>
                </tr>)}
                {palettes.map((item) => <tr
                    className="flex gap-10 border-b-1 border-gray-200 focus:bg-white"
                    key={"palette-" + item.name}>
                    <td className="m-2 w-20">Palette</td>
                    <td className="m-2 w-48 overflow-ellipsis">{item.name}</td>
                    <td className="m-2 w-20">(add size later)</td>
                    <td className="m-2 w-20">{item.updated}</td>
                </tr>)}
            </tbody>
        </table>
        {saveMode && <div className="flex">
            <input
                className="grow"
                type="text"
                placeholder="Enter save name"
                onChange={(event) => setSaveName(event.target.value)}>
            </input>
            <button
                className="m-2 px-2 py-1 bg-gray-100 border border-gray-300 cursor-pointer"
                onClick={handleSave}>Save</button>
            <button
                className="m-2 px-2 py-1 bg-gray-100 border border-gray-300 cursor-pointer"
                onClick={onCancel}>Cancel</button>
        </div>}
        {saveError && <p className="text-xs text-red-800">{saveError}</p>}
    </div>
}