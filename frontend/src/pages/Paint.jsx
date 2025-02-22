import React, { useState, useEffect, useRef, useCallback } from "react";
import Menu from "src/components/Menu";

export default function Paint() {
    const [width, setWidth] = useState(300);
    const [height, setHeight] = useState(300);
    const [coordinates, setCoordinates] = useState([0, 0]);
    const [palette, setPalette] = useState([]);
    const [menu, setMenu] = useState("");
    // const [menuOptions, setMenuOptions] = useState();

    const canvasRef = useRef();
    const docRef = useRef(document);
    // Had to make this a ref, or it wouldn't update
    const menuOpen = useRef(false);

    let canvasLeftDown = false;
    let canvasRightDown = false;
    let lastPoint = [0, 0];
    let currentPoint = [0, 0];
    let loopId;
    let menuLabels = ["File", "Edit", "View", "Settings"];

    const fileOptions = [
        { label: "New", type: "button", action: () => { } },
        { label: "Open", type: "button", action: () => { } },
        { label: "Save", type: "button", action: () => { } },
        { label: "Save next", type: "button", action: () => { } },
        { label: "Save as...", type: "button", action: () => { } },
        { label: "Export", type: "button", action: downloadImage },
        { label: "Export as...", type: "button", action: () => { } },
        { label: "Save palette", type: "button", action: () => { } },
        { label: "Save palette as...", type: "button", action: () => { } },
        { label: "Switch palette", type: "button", action: () => { } },
        { label: "Open and generate palette", type: "button", action: () => { } },
        { label: "Open with current palette", type: "button", action: () => { } },
        { label: "Open text editor", type: "button", action: () => { } }
    ];

    // { label: "Export", type: "anchor", url: canvasRef.current.toDataURL("image/png"), download: "Image" },

    const editOptions = [
        { label: "Undo", type: "button", action: () => { } },
        { label: "Redo", type: "button", action: () => { } },
        { label: "Copy", type: "button", action: () => { } },
        { label: "Cut", type: "button", action: () => { } },
        { label: "Paste", type: "button", action: () => { } },
        { label: "Scale image", type: "button", action: () => { } },
        { label: "Resize canvas", type: "button", action: () => { } }
    ];

    const viewOptions = [
        { label: "Zoom", type: "button", action: () => { } },
        { label: "Revert zoom", type: "button", action: () => { } },
        { label: "Toggle grid", type: "button", action: () => { } },
        { label: "Set grid size", type: "button", action: () => { } },
        { label: "Snap to grid", type: "button", action: () => { } },
        { label: "Toggle transparency", type: "button", action: () => { } }
    ];

    const settingsOptions = [
        { label: "Color mode", type: "button", action: () => { } },
        { label: "Save actions", type: "button", action: () => { } }
    ];


    function downloadImage(event) {
        let url = canvasRef.current.toDataURL("image/png");
        let a = docRef.current.createElement("a");
        a.href = url;
        a.download = "Testfile.png";
        a.click();
    }

    function onMenuOpen(event) {
        if (menu == event.target.id) {
            setMenu("");
            menuOpen.current = false;
        }
        else {
            setMenu(event.target.id);
            menuOpen.current = true;
        }

    }
    // Drawing in here rather than in mousemove event should be cheaper
    function drawingLoop(time) {
        // A drawing loop, called at 60 FPS or so
        if (canvasLeftDown) {
            const context = canvasRef.current.getContext("2d");
            // context.strokeStyle = "black";
            // context.lineWidth = 1;
            // context.moveTo(lastPoint[0], lastPoint[1]);
            // context.lineTo(currentPoint[0], currentPoint[1]);
            // context.closePath();
            // context.stroke();
            // I could draw a line but it's too smooth, try this instead 
            context.fillStyle = "black";
            context.fillRect(currentPoint[0], currentPoint[1], 1, 1);
            // This kind of dot pencil isn't too bad
            // Why not add a tool for it?
        }
        lastPoint = [...currentPoint];
        if (coordinates[0] != currentPoint[0] || coordinates[1] != currentPoint[1]) {
            setCoordinates([...currentPoint]);
        }
        loopId = requestAnimationFrame(drawingLoop);
    }

    // When switching to javascript dom, you'll have to be careful not to manipulate dom
    // React won't be able to react! But if I don't add/remove children it should be fine
    // Apparently, using useCallback can prevent unnecessary re-renders
    const onMove = useCallback((event) => {
        // Called on mouse movement
        let rect = canvasRef.current.getBoundingClientRect();
        let x = Math.round(event.clientX - rect.left);
        let y = Math.round(event.clientY - rect.top);
        currentPoint = [x, y];

        if (menuOpen.current && menu !== event.target.id && menuLabels.includes(event.target.id)) {
            setMenu(event.target.id);
        }
    }, []);

    const onDown = useCallback((event) => {
        // Called on mouse press
        let id = event.target.id;

        // Closes menu. Have to be careful not to toss that menu away before click event
        if (menuLabels.includes(id) == false && id != null && id.substr(0, 4) != "menu") {
            setMenu("");
            menuOpen.current = false;
        }
        if (id === "canvas") {
            canvasLeftDown = true;
        }
    }, []);

    const onRelease = useCallback((event) => {
        // Called on mouse release
        canvasLeftDown = false;
    }, []);

    useEffect(() => {
        // Sets up mouse listeners and main loop
        // Paints the canvas white
        const context = canvasRef.current.getContext("2d");
        context.fillStyle = "white";
        context.fillRect(0, 0, width, height);

        docRef.current.addEventListener("mousemove", onMove);
        docRef.current.addEventListener("mousedown", onDown);
        docRef.current.addEventListener("mouseup", onRelease);

        // Replace later. For now, I'm going to display some fancy gradient
        let colors = [];

        for (let i = 0; i < 16 * 16; i++) {
            let code = i.toString(16) + "0000"

            if (code.length == 5) {
                code = "#0" + code;
            }
            else {
                code = "#" + code;
            }

            colors.push({ index: i, color: code, style: { backgroundColor: code } });
        }
        setPalette(colors);
        loopId = requestAnimationFrame(drawingLoop);

        return () => {
            docRef.current.removeEventListener("mousemove", onMove);
            docRef.current.removeEventListener("mousedown", onDown);
            docRef.current.removeEventListener("mouseup", onRelease);
            cancelAnimationFrame(loopId);
        }
    }, [])

    return <div className="flex flex-col min-h-screen max-h-screen bg-gray-50">
        <div className="flex rounded-b-lg border-b border-b-gray-300">
            <nav>
                <ul className="flex text-sm ml-3 mt-1">
                    <li className="relative">
                        <button
                            id="File"
                            onClick={onMenuOpen}
                            className="hover:bg-gray-200 py-1 px-3">
                            File
                        </button>
                        {menu == "File" && <Menu options={fileOptions}></Menu>}
                    </li>
                    <li className="relative">
                        <button
                            id="Edit"
                            onClick={onMenuOpen}
                            className="hover:bg-gray-200 py-1 px-3">Edit
                        </button>
                        {menu == "Edit" && <Menu options={editOptions}></Menu>}
                    </li>
                    <li className="relative">
                        <button
                            id="View"
                            onClick={onMenuOpen}
                            className="hover:bg-gray-200 py-1 px-3">View
                        </button>
                        {menu == "View" && <Menu options={viewOptions}></Menu>}
                    </li>
                    <li className="relative">
                        <button
                            id="Settings"
                            onClick={onMenuOpen}
                            className="hover:bg-gray-200 py-1 px-3">Settings
                        </button>
                        {menu == "Settings" && <Menu options={settingsOptions}></Menu>}
                    </li>
                </ul>
            </nav>
        </div>
        <div className="flex flex-row border-b border-b-gray-300">
            <nav>
                <ul className="flex flex-row text-xs p-1 gap-1 border border-gray-100">
                    <li>Pencil</li>
                    <li>Brush</li>
                    <li>Fill</li>
                    <li>Eraser</li>
                </ul>
            </nav>
            <nav>
                <ul className="flex flex-row text-xs p-1 gap-1 border-gray-100">
                    <li>Line</li>
                    <li>Rectangle</li>
                    <li>Fill rectangle</li>
                    <li>Circle</li>
                    <li>Fill circle</li>
                </ul>
            </nav>
            <nav>
                <ul className="flex flex-row text-xs p-1 gap-1 border border-gray-100">
                    <li>Select</li>
                    <li>Copy</li>
                    <li>Cut</li>
                    <li>Paste</li>
                </ul>
            </nav>
            <nav>
                <ul className="flex flex-row text-xs p-1 gap-1 border border-gray-100">
                    <li>Dithering brush</li>
                    <li>Dithering fill</li>
                    <li>Dithering pattern</li>
                </ul>
            </nav>
            <nav>
                <ul className="flex flex-row text-xs p-1 gap-1 border border-gray-100">
                    <li>Zoom</li>
                    <li>Revert zoom</li>
                </ul>
            </nav>
        </div>
        {/* Needed min-h-full to lower height and enforce scroll */}
        <div className="flex grow min-h-full">
            <div className="flex flex-col grow items-center overflow-scroll bg-gray-300">
                <div className="bg-gray-300 w-[360px] min-h-[60px]"></div>
                <canvas
                    id="canvas"
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="w-[300px] h-[300px]">
                </canvas>
                <div className="bg-gray-300 w-[360px] min-h-[60px]"></div>
            </div>
            <div className="flex flex-col">
                <div className="grid grid-cols-16 gap-0 p-1 m-1 bg-gray-100 border border-gray-300">
                    {palette.map((color) => <div
                        key={color.index}
                        className={"size-3 border border-t-gray-800 border-l-gray-800 border-b-gray-300 border-r-gray-300"}
                        style={{ background: color.color }}></div>)}
                </div>
                <div className="flex">
                    Active colors
                </div>
                <div className="flex flex-col">
                    Layers
                </div>
            </div>
        </div>
        <div className="flex flex-row-reverse text-xs border-t border-t-gray-300">
            <div className="flex m-1 mr-3">
                ({coordinates[0]}, {coordinates[1]})
            </div>
        </div>
    </div>
}