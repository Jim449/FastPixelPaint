import React, { useState, useEffect, useRef, useCallback } from "react";
import Menu from "src/components/Menu";
import ToolButton from "src/components/ToolButton";

export default function Paint() {
    const [canvasWidth, setCanvasWidth] = useState(300);
    const [canvasHeight, setCanvasHeight] = useState(300);
    const [coordinates, setCoordinates] = useState([0, 0]);
    const [palette, setPalette] = useState([]);
    const [menu, setMenu] = useState("");
    const [tool, setTool] = useState("");

    const canvasRef = useRef();
    const overlayRef = useRef();
    const docRef = useRef(document);
    // Had to make this a ref, or it wouldn't update
    const menuOpen = useRef(false);
    const activeTool = useRef({ tool: "Fill ellipse", size: 1, color: "black", red: 0, blue: 0, green: 0, colorIndex: 0 });

    let canvasLeftDown = false;
    let canvasRightDown = false;
    let shiftDown = false;
    let startPoint = [0, 0];
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

    const drawingTools = ["Pencil", "Brush", "Dotter", "Bucket", "Eraser", "Dithering pencil", "Dithering bucket"];
    const geometryTools = ["Line", "Rectangle", "Fill rectangle", "Ellipse", "Fill ellipse"];


    function downloadImage(event) {
        let url = canvasRef.current.toDataURL("image/png");
        let a = docRef.current.createElement("a");
        a.href = url;
        a.download = "Testfile.png";
        a.click();
    }

    function onMenuOpen(event) {
        // Toggles dropdown menu
        if (menu == event.target.id) {
            setMenu("");
            menuOpen.current = false;
        }
        else {
            setMenu(event.target.id);
            menuOpen.current = true;
        }
    }

    function onToolSelect(event) {
        setTool(event.target.id);
        activeTool.current.tool = event.target.id;
    }

    function getStart(x1, x2) {
        return Math.min(x1, x2);
    }

    function getLength(x1, x2) {
        return Math.abs(x2 - x1);
    }


    // Drawing in here rather than in mousemove event should be cheaper
    function drawingLoop(time) {
        // A drawing loop, called at 60 FPS or so
        if (canvasLeftDown) {
            let tool = activeTool.current;

            if (drawingTools.includes(tool.tool)) {
                const context = canvasRef.current.getContext("2d");

                if (tool.tool === "Pencil") {
                    context.strokeStyle = tool.color;
                    context.lineWidth = tool.size;
                    context.moveTo(lastPoint[0], lastPoint[1]);
                    context.lineTo(currentPoint[0], currentPoint[1]);
                    context.closePath();
                    context.stroke();
                    // This is all well and good but it's smooth
                    // It isn't what I'd call pixel art
                }
                else if (tool.tool === "Dotter") {
                    context.fillStyle = tool.color;
                    context.fillRect(currentPoint[0], currentPoint[1], tool.size, tool.size);
                }
            }
            else if (geometryTools.includes(tool.tool)) {
                const context = overlayRef.current.getContext("2d");
                let startX = getStart(startPoint[0], currentPoint[0]);
                let startY = getStart(startPoint[1], currentPoint[1]);
                let dx = getLength(startPoint[0], currentPoint[0]);
                let dy = getLength(startPoint[1], currentPoint[1]);

                context.clearRect(0, 0, canvasWidth, canvasHeight);
                context.beginPath();

                if (tool.tool === "Line") {
                    context.strokeStyle = tool.color;
                    context.lineWidth = tool.size;
                    context.moveTo(startPoint[0], startPoint[1]);
                    context.lineTo(currentPoint[0], currentPoint[1]);
                    context.closePath();
                    context.stroke();
                }
                else if (tool.tool === "Rectangle") {
                    context.strokeStyle = tool.color;
                    context.lineWidth = tool.size;
                    context.strokeRect(startX + 0.5, startY + 0.5, dx, dy);
                }
                else if (tool.tool === "Fill rectangle") {
                    context.fillStyle = tool.color;
                    context.fillRect(startX, startY, dx, dy);
                }
                else if (tool.tool === "Ellipse") {
                    context.strokeStyle = tool.color;
                    context.lineWidth = tool.size;
                    context.ellipse((startPoint[0] + currentPoint[0]) / 2, (startPoint[1] + currentPoint[1]) / 2, dx / 2, dy / 2, 0, 0, Math.PI * 2);
                    context.stroke();
                }
                else if (tool.tool === "Fill ellipse") {
                    context.fillStyle = tool.color;
                    context.ellipse((startPoint[0] + currentPoint[0]) / 2, (startPoint[1] + currentPoint[1]) / 2, dx / 2, dy / 2, 0, 0, Math.PI * 2);
                    context.fill();
                }
            }
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
        if (id === "overlay") {
            let rect = canvasRef.current.getBoundingClientRect();
            let x = Math.round(event.clientX - rect.left);
            let y = Math.round(event.clientY - rect.top);
            canvasLeftDown = true;
            startPoint = [x, y];
        }
    }, []);

    const onRelease = useCallback((event) => {
        // Called on mouse release
        if (canvasLeftDown) {
            console.log()
            if (geometryTools.includes(activeTool.current.tool)) {
                let context = canvasRef.current.getContext("2d");
                context.drawImage(overlayRef.current, 0, 0);
            }
        }
        let overlayContect = overlayRef.current.getContext("2d");
        overlayContect.clearRect(0, 0, canvasWidth, canvasHeight);
        canvasLeftDown = false;
    }, []);

    useEffect(() => {
        // Sets up mouse listeners and main loop
        // Paints the canvas white
        const context = canvasRef.current.getContext("2d");
        context.fillStyle = "white";
        context.fillRect(0, 0, canvasWidth, canvasHeight);

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
                            className="hover:bg-gray-200 pt-1 pb-2 px-3">
                            File
                        </button>
                        {menu == "File" && <Menu options={fileOptions}></Menu>}
                    </li>
                    <li className="relative">
                        <button
                            id="Edit"
                            onClick={onMenuOpen}
                            className="hover:bg-gray-200 pt-1 pb-2 px-3">Edit
                        </button>
                        {menu == "Edit" && <Menu options={editOptions}></Menu>}
                    </li>
                    <li className="relative">
                        <button
                            id="View"
                            onClick={onMenuOpen}
                            className="hover:bg-gray-200 pt-1 pb-2 px-3">View
                        </button>
                        {menu == "View" && <Menu options={viewOptions}></Menu>}
                    </li>
                    <li className="relative">
                        <button
                            id="Settings"
                            onClick={onMenuOpen}
                            className="hover:bg-gray-200 pt-1 pb-2 px-3">Settings
                        </button>
                        {menu == "Settings" && <Menu options={settingsOptions}></Menu>}
                    </li>
                </ul>
            </nav>
        </div>
        <div className="flex flex-row border-b border-b-gray-300">
            <nav>
                <ul className="flex flex-row text-xs border-l border-r border-gray-300">
                    <li><button className="py-1 px-2">Size</button></li>
                </ul>
            </nav>
            <nav>
                <ul className="flex flex-row text-xs border-l border-r border-gray-300">
                    <ToolButton name="Pencil" icon={null} selectedTool={tool} onClick={onToolSelect}></ToolButton>
                    <ToolButton name="Brush" icon={null} selectedTool={tool} onClick={onToolSelect}></ToolButton>
                    <ToolButton name="Dotter" icon={null} selectedTool={tool} onClick={onToolSelect}></ToolButton>
                    <ToolButton name="Bucket" icon={null} selectedTool={tool} onClick={onToolSelect}></ToolButton>
                    <ToolButton name="Eraser" icon={null} selectedTool={tool} onClick={onToolSelect}></ToolButton>
                </ul>
            </nav>
            <nav>
                <ul className="flex flex-row text-xs border-l border-r border-gray-300">
                    <ToolButton name="Line" icon={null} selectedTool={tool} onClick={onToolSelect}></ToolButton>
                    <ToolButton name="Rectangle" icon={null} selectedTool={tool} onClick={onToolSelect}></ToolButton>
                    <ToolButton name="Fill rectangle" icon={null} selectedTool={tool} onClick={onToolSelect}></ToolButton>
                    <ToolButton name="Ellipse" icon={null} selectedTool={tool} onClick={onToolSelect}></ToolButton>
                    <ToolButton name="Fill ellipse" icon={null} selectedTool={tool} onClick={onToolSelect}></ToolButton>
                </ul>
            </nav>
            <nav>
                <ul className="flex flex-row text-xs border-l border-r border-gray-300">
                    <li><button className="py-1 px-2">Select</button></li>
                    <li><button className="py-1 px-2">Copy</button></li>
                    <li><button className="py-1 px-2">Cut</button></li>
                    <li><button className="py-1 px-2">Paste</button></li>
                </ul>
            </nav>
            <nav>
                <ul className="flex flex-row text-xs border-l border-r border-gray-300">
                    <ToolButton name="Dithering pencil" icon={null} selectedTool={tool} onClick={onToolSelect}></ToolButton>
                    <ToolButton name="Dithering bucket" icon={null} selectedTool={tool} onClick={onToolSelect}></ToolButton>
                    <li><button className="py-1 px-2">Dithering pattern</button></li>
                </ul>
            </nav>
            <nav>
                <ul className="flex flex-row text-xs border-l border-r border-gray-300">
                    <li><button className="py-1 px-2">Zoom</button></li>
                    <li><button className="py-1 px-2">Restore zoom</button></li>
                </ul>
            </nav>
        </div>
        {/* Needed min-h-full to lower height and enforce scroll */}
        <div className="flex grow min-h-full">
            <div className="flex flex-col grow items-center overflow-scroll bg-gray-300">
                <div className="bg-gray-300 w-[360px] min-h-[60px]"></div>
                <div
                    className="relative w-[300px] h-[300px]">
                    <canvas
                        id="canvas"
                        ref={canvasRef}
                        width={canvasWidth}
                        height={canvasHeight}
                        className="absolute top-0 left-0 w-[300px] h-[300px] z-0">
                    </canvas>
                    <canvas
                        id="overlay"
                        ref={overlayRef}
                        width={canvasWidth}
                        height={canvasHeight}
                        className="absolute top-0 left-0 w-[300px] h-[300px] z-10">
                    </canvas>
                </div>

                <div className="bg-gray-300 w-[360px] min-h-[60px]"></div>
            </div>
            <div className="flex flex-col border-l border-l-gray-300">
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