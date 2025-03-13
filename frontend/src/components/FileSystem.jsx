import React, { useState, useEffect } from "react"
import { authStore } from "src/store/authStore"

export default function FileSystem({ mode, action, onCancel }) {
    const token = authStore((state) => state.token);
    const folderId = authStore((state) => state.folderId);
    const rootId = authStore((state) => state.rootId);
    const setCurrentFolder = authStore((state) => state.setFolder);
    const [activeFolder, setActiveFolder] = useState([]);
    const [parentFolder, setParentFolder] = useState(null);
    const [folders, setFolders] = useState([]);
    const [images, setImages] = useState([]);
    const [palettes, setPalettes] = useState([]);
    const [nameField, setNameField] = useState(false);
    const [saveName, setSaveName] = useState("");
    const [saveError, setSaveError] = useState("");
    const [path, setPath] = useState([]);

    let selected = null;

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
                setParentFolder({ ...data.parent_folder, type: "Parent folder", order: 0 });
                setActiveFolder({ ...data.current_folder, type: "Current folder" });
                setFolders(sortItems(data.folders, "Folder"));
                setImages(sortItems(data.images, "Images"));
                setPalettes(sortItems(data.palettes, "Palettes"));
                setCurrentFolder(data.current_folder.id);
                setPathList(data.current_folder.path);
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    async function searchFolder(token, path) {
        // Opens the folder with the given path
        let url = `http://localhost:8000/v1/path?path=${path}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 200) {
                const data = await response.json();
                setParentFolder({ ...data.parent_folder, type: "Parent folder", order: 0 });
                setActiveFolder({ ...data.current_folder, type: "Current folder" });
                setFolders(sort(data.folders, "Folder"));
                setImages(sort(data.images, "Image"));
                setPalettes(sort(data.palettes, "Palette"));
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
        // Checks if file can be saved. Handle save using passed function
        if (saveName.includes("/")) {
            setSaveError("Invalid file name. Ensure name doesn't include any '/'");
        }
        else {
            action(saveName, activeFolder);
        }
    }


    function handleOpen(event) {
        // Opens the selected item
        // Folders are opened
        // Images or palettes are handled according to a passed function
        if (!selected) return;
        else if (selected.type === "Folder" || selected.type === "Parent folder") {
            openFolder(token, selected.id);
        }
        else if ((!mode || mode === "Open image") && selected.type === "Image") {
            action(selected);
        }
        else if ((!mode || mode === "Open palette") && selected.type === "Palette") {
            action(selected);
        }
    }


    function handleDoubleClick(item) {
        // Opens or overwrites the selected item
        // TODO will only open at this point. Overwrite should have prompt?
        selected = item;
        if (!mode || mode.includes("Open")) handleOpen(null);
    }


    function sortItems(items, type) {
        // Sorts numerically
        items.sort((a, b) => { a.name - b.name })

        for (let i = 0; i < items.length; i++) {
            items[i].order = i;
            items[i].type = type;
        }
        return items
    }


    function select(item) {
        // Sets the selected item
        // TODO it should be possible to navigate using arrows
        // or even something like ctrl/shift-click
        // I could set a flag so I don't have to rely on focus:bg
        // Or add an action listener to tab: selected = null; 
        selected = item;
        console.log(selected);
    }


    async function createFolder(token, parent, name) {
        // Creates a new folder
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
        // Opens a folder, depending on state
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
                    className="underline hover:text-blue-600 cursor-pointer"
                    onClick={(event) => searchFolder(token, item.path)}>{item.name}
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
                <tr className="flex bg-gray-100 border-b-1 border-gray-300 text-sm">
                    <th className="m-2 w-20">Type</th>
                    <th className="m-2 grow">Name</th>
                    <th className="m-2 w-20">Size</th>
                    <th className="m-2 w-20">Updated</th>
                </tr>
            </thead>
            <tbody>
                {!activeFolder.root && <tr
                    className="flex border-b-1 border-gray-200 focus:bg-blue-100 text-sm"
                    onClick={(event) => select(parentFolder)}
                    onDoubleClick={(event) => openFolder(token, activeFolder.parent_id)}
                    tabIndex={-1}
                    key={"go-up"}>
                    <td className="m-1 w-20">Folder</td>
                    <td className="m-1 grow overflow-ellipsis">[Go up] {parentFolder?.name}</td>
                    <td className="m-1 w-20"></td>
                    <td className="m-1 w-20"></td>
                </tr>}
                {folders.map((item) => <tr
                    className="flex border-b-1 border-gray-200 focus:bg-blue-100 text-sm"
                    onClick={(event) => select(item)}
                    onDoubleClick={(event) => openFolder(token, item.id)}
                    tabIndex={-1}
                    key={"row-" + item.path}>
                    <td className="m-1 w-20">Folder</td>
                    <td className="m-1 grow overflow-ellipsis">{item.name}</td>
                    <td className="m-1 w-20"></td>
                    <td className="m-1 w-20"></td>
                </tr>)}
                {images.map((item) => <tr
                    className="flex border-b-1 border-gray-200 focus:bg-blue-100 text-sm"
                    key={"image-" + item.name}
                    onClick={(event) => select(item)}
                    onDoubleClick={(event) => handleDoubleClick(item)}
                    tabIndex={-1}>
                    <td className="m-1 w-20">Image</td>
                    <td className="m-1 grow overflow-ellipsis">{item.name}</td>
                    <td className="m-1 w-20">{item.width}x{item.height}</td>
                    <td className="m-1 w-20">{item.updated}</td>
                </tr>)}
                {palettes.map((item) => <tr
                    className="flex border-b-1 border-gray-200 focus:bg-blue-100 text-sm"
                    key={"palette-" + item.name}
                    onClick={(event) => select(item)}
                    onDoubleClick={(event) => handleDoubleClick(item)}
                    tabIndex={-1}>
                    <td className="m-1 w-20">Palette</td>
                    <td className="m-1 grow overflow-ellipsis">{item.name}</td>
                    <td className="m-1 w-20">(add size later)</td>
                    <td className="m-1 w-20">{item.updated}</td>
                </tr>)}
            </tbody>
        </table>
        {mode === "Save" && <div className="flex">
            <input
                className="grow m-2 pl-2"
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
        {mode.includes("Open") && <div className="flex">
            <button
                className="m-2 px-2 py-1 bg-gray-100 border border-gray-300 cursor-pointer text-sm"
                onClick={handleOpen}>{mode}</button>
            <button
                className="m-2 px-2 py-1 bg-gray-100 border border-gray-300 cursor-pointer text-sm"
                onClick={onCancel}>Cancel</button>
        </div>}
        {saveError && <p className="ml-2 text-xs text-red-800">{saveError}</p>}
    </div>
}