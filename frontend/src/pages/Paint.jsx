import React, { useState, useEffect, useRef, useCallback } from "react";
import Menu from "src/components/Menu";
import ToolButton from "src/components/ToolButton";
import PaletteButton from "src/components/PaletteButton";
import ColorPicker from "src/components/ColorPicker";
import { standardPalette } from "src/scripts/user_setup";
import { getDot, getLine, getStraightLine, getCircle, getEllipse, fillEllipse, getRectangle, fillRectangle } from "src/scripts/geometry";
import { Drawing, PaletteColor } from "src/scripts/drawing";
import { authStore } from "src/store/authStore";
import { useNavigate } from "react-router-dom";
import { hexToColor, rgbToHex } from "../scripts/drawing";

export default function Paint() {
    const { token } = authStore();
    const userData = authStore((state) => state.userData);
    const fetchUser = authStore((state) => state.fetchUser);

    const [canvasWidth, setCanvasWidth] = useState(300);
    const [canvasHeight, setCanvasHeight] = useState(300);
    const [coordinates, setCoordinates] = useState([0, 0]);
    const [palette, setPalette] = useState([]);
    const [menu, setMenu] = useState("");
    const [tool, setTool] = useState("");
    const [primaryColor, setPrimaryColor] = useState(new PaletteColor(0, 0, 0, -1 - 1));
    const [secondaryColor, setSecondaryColor] = useState(new PaletteColor(255, 255, 255, -1 - 1));
    const [loggedIn, setLoggedIn] = useState((token) ? true : false);

    const drawing = useRef(new Drawing(300, 300));
    const canvasRef = useRef();
    const overlayRef = useRef();
    const docRef = useRef(document);
    // Had to make this a ref, or it wouldn't update
    const menuOpen = useRef(false);
    const activeTool = useRef({ tool: "", size: 1, color: "#000000", eraser: "#ffffff", red: 0, blue: 0, green: 0, alpha: 255, colorIndex: 0 });
    const navigate = useNavigate();

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
        { label: "Open text editor", type: "button", action: () => { } },
        { label: "Close painter", type: "button", action: () => { navigate("/") } }
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

    const drawingTools = ["Pencil", "Dotter", "Bucket", "Eraser", "Dithering pencil", "Dithering bucket"];
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

    function onPaletteClick(event, index, order, color) {
        let red = hexToColor(color, 0);
        let green = hexToColor(color, 1);
        let blue = hexToColor(color, 2);
        setPrimaryColor(new PaletteColor(red, green, blue, index, order));
        activeTool.current.color = color;
        activeTool.current.colorIndex = index;
    }

    function onPaletteRightClick(event, index, order, color) {
        let red = hexToColor(color, 0);
        let green = hexToColor(color, 1);
        let blue = hexToColor(color, 2);
        setSecondaryColor(new PaletteColor(red, green, blue, index, order));
        activeTool.current.eraser = color;
    }

    function previewPrimaryColor(red, green, blue) {
        setPrimaryColor(new PaletteColor(red, green, blue, primaryColor.index, primaryColor.order));
    }

    function previewSecondaryColor(red, green, blue) {
        setSecondaryColor(new PaletteColor(red, green, blue, secondaryColor.index, secondaryColor.order));
    }

    function modifyPrimaryColor(red, green, blue, index, order) {
        red = Math.max(Math.min(Number(red), 255), 0);
        green = Math.max(Math.min(Number(green), 255), 0);
        blue = Math.max(Math.min(Number(blue), 255), 0);

        let newPalette = [...palette];
        let color = rgbToHex(red, green, blue);

        newPalette[order] = {
            color: color,
            index: index,
            order: order
        };
        console.log(newPalette);
        setPalette(newPalette);
        activeTool.current.color = color;
    }

    function modifySecondaryColor(red, green, blue, index, order) {
        red = Math.max(Math.min(Number(red), 255), 0);
        green = Math.max(Math.min(Number(green), 255), 0);
        blue = Math.max(Math.min(Number(blue), 255), 0);

        let newPalette = [...palette];
        let color = rgbToHex(red, green, blue);
        newPalette[order] = {
            color: color,
            index: index,
            order: order
        };
        setPalette(newPalette);
        activeTool.current.eraser = color;
    }

    function getStart(x1, x2) {
        // Use on x, y to get the upper left corner
        return Math.min(x1, x2);
    }

    function getLineStart(x1, x2) {
        // Use on x, y to get the starting line coordinates
        // Assumes drawing is done in a box with top left corner 0,0
        if (x2 > x1) return 0;
        else return x1 - x2;
    }

    function getLineEnd(x1, x2) {
        // Use on x, y to get the ending line coordinates
        // Assumes drawing is done in a box with top left corner 0,0
        if (x2 > x1) return x2 - x1;
        else return 0;
    }

    function getSquareStart(x1, x2, distance) {
        // Gets a coordinate from which to draw a square or circle
        // inside a potential non-square area
        if (x2 > x1) return x1;
        else return x1 - distance;
    }

    function getLength(x1, x2) {
        // Returns the distance between two coordinates
        // If x1 == x2, returns 1 since the pixel at x1
        // should still be painted
        return Math.abs(x2 - x1) + 1;
    }

    // Drawing in here rather than in mousemove event should be cheaper
    function drawingLoop(time) {
        // A drawing loop, called at 60 FPS or so
        if (canvasLeftDown || canvasRightDown) {
            let tool = activeTool.current;

            if (drawingTools.includes(tool.tool)) {
                const context = canvasRef.current.getContext("2d");

                if (tool.tool === "Pencil") {
                    // TODO I can improve performance by drawing in a smaller box
                    drawing.current.addToDrawing(context, overlayRef.current, tool,
                        getLine(lastPoint[0], lastPoint[1],
                            currentPoint[0], currentPoint[1]));
                }
                else if (tool.tool === "Dotter") {
                    // TODO I can improve performance by drawing in a miniscule box
                    drawing.current.addToDrawing(context, overlayRef.current, tool,
                        getDot(currentPoint[0], currentPoint[1]));
                }
            }
            else if (geometryTools.includes(tool.tool)) {
                const context = overlayRef.current.getContext("2d");
                let startX = getStart(startPoint[0], currentPoint[0]);
                let startY = getStart(startPoint[1], currentPoint[1]);
                let dx = getLength(startPoint[0], currentPoint[0]);
                let dy = getLength(startPoint[1], currentPoint[1]);

                if (tool.tool === "Line") {
                    if (shiftDown) {
                        drawing.current.previewGeometry(context, tool,
                            getStraightLine(getLineStart(startPoint[0], currentPoint[0]),
                                getLineStart(startPoint[1], currentPoint[1]),
                                getLineEnd(startPoint[0], currentPoint[0]),
                                getLineEnd(startPoint[1], currentPoint[1])),
                            startX, startY, dx, dy);
                    }
                    else {
                        drawing.current.previewGeometry(context, tool,
                            getLine(getLineStart(startPoint[0], currentPoint[0]),
                                getLineStart(startPoint[1], currentPoint[1]),
                                getLineEnd(startPoint[0], currentPoint[0]),
                                getLineEnd(startPoint[1], currentPoint[1])),
                            startX, startY, dx, dy);
                    }
                }
                else if (tool.tool === "Rectangle") {
                    if (shiftDown) {
                        let distance = Math.min(dx, dy);
                        drawing.current.previewGeometry(context, tool,
                            getRectangle(0, 0, distance - 1, distance - 1),
                            getSquareStart(startPoint[0], currentPoint[0], distance),
                            getSquareStart(startPoint[1], currentPoint[1], distance),
                            distance, distance);
                    }
                    else {
                        drawing.current.previewGeometry(context, tool,
                            getRectangle(0, 0, dx - 1, dy - 1),
                            startX, startY, dx, dy);
                    }
                }
                else if (tool.tool === "Fill rectangle") {
                    if (shiftDown) {
                        let distance = Math.min(dx, dy);
                        drawing.current.previewGeometry(context, tool,
                            fillRectangle(0, 0, distance - 1, distance - 1),
                            getSquareStart(startPoint[0], currentPoint[0], distance),
                            getSquareStart(startPoint[1], currentPoint[1], distance),
                            distance, distance);
                    }
                    else {
                        drawing.current.previewGeometry(context, tool,
                            fillRectangle(0, 0, dx - 1, dy - 1),
                            startX, startY, dx, dy);
                    }
                }
                else if (tool.tool === "Ellipse") {
                    if (shiftDown) {
                        let distance = Math.min(dx, dy);
                        drawing.current.previewGeometry(context, tool,
                            getCircle(0, 0, distance - 1, distance - 1),
                            getSquareStart(startPoint[0], currentPoint[0], distance),
                            getSquareStart(startPoint[1], currentPoint[1], distance),
                            distance, distance);
                    }
                    else {
                        drawing.current.previewGeometry(context, tool,
                            getEllipse(0, 0, dx - 1, dy - 1),
                            startX, startY, dx, dy);
                    }
                }
                else if (tool.tool === "Fill ellipse") {
                    if (shiftDown) {
                        let distance = Math.min(dx, dy);
                        drawing.current.previewGeometry(context, tool,
                            fillEllipse(0, 0, distance - 1, distance - 1),
                            getSquareStart(startPoint[0], currentPoint[0], distance),
                            getSquareStart(startPoint[1], currentPoint[1], distance),
                            distance, distance);
                    }
                    else {
                        drawing.current.previewGeometry(context, tool,
                            fillEllipse(0, 0, dx - 1, dy - 1),
                            startX, startY, dx, dy);
                    }
                }
            }
        }
        lastPoint = [...currentPoint];
        if (coordinates[0] != currentPoint[0] || coordinates[1] != currentPoint[1]) {
            setCoordinates([...currentPoint]);
        }
        loopId = requestAnimationFrame(drawingLoop);
    }

    // Apparently, using useCallback can prevent unnecessary re-renders
    const onMove = useCallback((event) => {
        // Called on mouse movement
        let rect = canvasRef.current.getBoundingClientRect();
        let x = Math.round(event.clientX - rect.left);
        let y = Math.round(event.clientY - rect.top);
        shiftDown = (event.shiftKey) ? true : false;
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
            // Mouse on canvas, prepare for painting
            let rect = canvasRef.current.getBoundingClientRect();
            let x = Math.round(event.clientX - rect.left);
            let y = Math.round(event.clientY - rect.top);

            if (event.button === 0 && !canvasRightDown) {
                canvasLeftDown = true;
                // if (drawingTools.includes(activeTool.current.tool)) {
                //     drawing.current.startDrawing(overlayRef.current.getContext("2d"));
                // }
                activeTool.current.red = hexToColor(activeTool.current.color, 0);
                activeTool.current.green = hexToColor(activeTool.current.color, 1);
                activeTool.current.blue = hexToColor(activeTool.current.color, 2);
            }
            else if (event.button === 2 && !canvasLeftDown) {
                canvasRightDown = true;
                // if (drawingTools.includes(activeTool.current.tool)) {
                //     drawing.current.startDrawing(overlayRef.current.getContext("2d"));
                // }
                activeTool.current.red = hexToColor(activeTool.current.eraser, 0);
                activeTool.current.green = hexToColor(activeTool.current.eraser, 1);
                activeTool.current.blue = hexToColor(activeTool.current.eraser, 2);
            }
            startPoint = [x, y];
        }
    }, []);

    const onRelease = useCallback((event) => {
        // Called on mouse release
        // Commits drawn geometry to canvas
        if (canvasLeftDown || canvasRightDown) {
            if (drawingTools.includes(activeTool.current.tool)) {
                // let context = canvasRef.current.getContext("2d");
                // drawing.current.finishDrawing(context, overlayRef.current);
                let overlayContext = overlayRef.current.getContext("2d");
                overlayContext.clearRect(0, 0, canvasWidth, canvasHeight);
            }
            else if (geometryTools.includes(activeTool.current.tool)) {
                let context = canvasRef.current.getContext("2d");
                drawing.current.commitGeometry(context, overlayRef.current, activeTool.current,
                    drawing.current.savedShape, drawing.current.savedX, drawing.current.savedY,
                    drawing.current.savedWidth, drawing.current.savedHeight);

                let overlayContext = overlayRef.current.getContext("2d");
                overlayContext.clearRect(0, 0, canvasWidth, canvasHeight);
            }
            canvasLeftDown = false;
            canvasRightDown = false;
        }
    }, []);


    async function get_palette(id) {
        // Returns a palette with a specific id or the users default palette 
        try {
            let path = (id === null) ? "http://localhost:8000/default_palette" : `http://localhost:8000/palette${id}`;

            const response = await fetch(path,
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });
            const data = await response.json();

            if (!response.ok) throw new Error("Error when fetching palette");

            const codes = data.colors.map((item) => {
                rgbToHex(item.red, item.green, item.blue);
            });
            setPalette(codes);
        }
        catch { }
    }

    useEffect(() => {
        // Sets up mouse listeners and main loop
        // Sets up the drawing class

        docRef.current.addEventListener("mousemove", onMove);
        docRef.current.addEventListener("mousedown", onDown);
        docRef.current.addEventListener("mouseup", onRelease);

        window.oncontextmenu = (event) => { event.preventDefault() }

        // get_palette(null);
        setPalette(standardPalette);

        loopId = requestAnimationFrame(drawingLoop);

        drawing.current.setImage(canvasRef);
        drawing.current.setPreview(overlayRef);

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
            {/* Box-sizing and -4 positioning ensures border can be fully covered by canvas */}
            <div className="flex flex-col grow items-center overflow-scroll bg-gray-300">
                <div className="bg-gray-300 w-[360px] min-h-[60px]"></div>
                <div
                    className="relative w-[300px] h-[300px] bg-gray-300 box-border border-4 border-dashed border-gray-200">
                    <canvas
                        id="canvas"
                        ref={canvasRef}
                        width={canvasWidth}
                        height={canvasHeight}
                        className="absolute top-[-4px] left-[-4px] w-[300px] h-[300px] z-0">
                    </canvas>
                    <canvas
                        id="overlay"
                        ref={overlayRef}
                        width={canvasWidth}
                        height={canvasHeight}
                        className="absolute top-[-4px] left-[-4px] w-[300px] h-[300px] z-10">
                    </canvas>
                </div>

                <div className="bg-gray-300 w-[360px] min-h-[60px]"></div>
            </div>
            <div className="flex flex-col border-l border-l-gray-300">
                <div className="grid grid-cols-16 gap-0 p-1 m-1 bg-gray-100 border border-gray-300">
                    {palette.map((color) =>
                        <PaletteButton
                            key={color.index}
                            index={color.index}
                            color={color.color}
                            order={color.order}
                            action={onPaletteClick}
                            rightClick={onPaletteRightClick}>
                        </PaletteButton>)}
                </div>
                <div className="flex gap-2 m-2">
                    <div
                        className="size-6 border-2 border-t-gray-800 border-l-gray-800 border-b-gray-300 border-r-gray-300"
                        style={{ background: primaryColor.color }}></div>
                    <div
                        className="size-6 border-2 border-t-gray-800 border-l-gray-800 border-b-gray-300 border-r-gray-300"
                        style={{ background: secondaryColor.color }}></div>
                </div>
                <ColorPicker
                    color={primaryColor}
                    previewColor={previewPrimaryColor}
                    setColor={modifyPrimaryColor}
                    colorType="primary"></ColorPicker>
                <ColorPicker
                    color={secondaryColor}
                    previewColor={previewSecondaryColor}
                    setColor={modifySecondaryColor}
                    colorType="secondary"></ColorPicker>
            </div>
        </div>
        <div className="flex flex-row-reverse text-xs border-t border-t-gray-300">
            <div className="flex m-1 mr-3">
                ({coordinates[0]}, {coordinates[1]})
            </div>
        </div>
    </div>
}