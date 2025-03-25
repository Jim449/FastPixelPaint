import React, { useState, useEffect, useRef, useCallback } from "react";
import Menu from "src/components/Menu";
import ToolButton from "src/components/ToolButton";
import PaletteButton from "src/components/PaletteButton";
import ColorPicker from "src/components/ColorPicker";
import MessageWindow from "src/components/MessageWindow";
import FileSystem from "src/components/FileSystem";
import { getDot, getLine, getStraightLine, getCircle, getEllipse, fillEllipse, getRectangle, fillRectangle } from "src/scripts/geometry";
import { Drawing, ImageLayer, PaletteColor } from "src/scripts/drawing";
import { authStore } from "src/store/authStore";
import { useNavigate } from "react-router-dom";
import { hexToColor, rgbToHex, Palette } from "../scripts/drawing";

export default function Paint() {
    const { token } = authStore();

    const [canvasWidth, setCanvasWidth] = useState(300);
    const [canvasHeight, setCanvasHeight] = useState(300);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [coordinates, setCoordinates] = useState([0, 0]);
    const [palette, setPalette] = useState([]);
    const [menu, setMenu] = useState("");
    const [message, setMessage] = useState("");
    const [tool, setTool] = useState("");
    const [primaryColor, setPrimaryColor] = useState(new PaletteColor(0, 0, 0, -1 - 1));
    const [secondaryColor, setSecondaryColor] = useState(new PaletteColor(255, 255, 255, -1 - 1));
    const [loggedIn, setLoggedIn] = useState((token) ? true : false);
    const [file, setFile] = useState(null);

    const drawing = useRef(new Drawing(300, 300));
    const canvasRef = useRef();
    const overlayRef = useRef();
    const docRef = useRef(document);
    // Had to make this a ref, or it wouldn't update
    const menuOpen = useRef(false);
    // This too
    const activeTool = useRef({ tool: "", size: 1, color: "#000000", red: 0, blue: 0, green: 0, alpha: 255, colorIndex: 0 });
    // I do have color states but I need mutable objects
    const primaryCRef = useRef({});
    const secondaryCRef = useRef({});
    const zoomRef = useRef(1);
    const navigate = useNavigate();

    let canvasLeftDown = false;
    let canvasRightDown = false;
    let shiftDown = false;
    let startPoint = [0, 0];
    let lastPoint = [0, 0];
    let currentPoint = [0, 0];
    let loopId;
    let menuLabels = ["File", "Edit", "View", "Palette", "Settings"];

    const fileOptions = [
        { label: "New", type: "button", action: () => { } },
        { label: "Open", type: "button", action: imageOpenMenu },
        {
            label: "Save", type: "button", action: () => {
                saveImage(drawing.current, token, "POST");
            }
        },
        { label: "Save next", type: "button", action: () => { } },
        { label: "Save as...", type: "button", action: imageSaveMenu },
        { label: "Export", type: "button", action: downloadImage },
        // { label: "Open and generate palette", type: "button", action: () => { } },
        // { label: "Open with current palette", type: "button", action: () => { } },
        // { label: "Open text editor", type: "button", action: () => { } },
        { label: "Close painter", type: "button", action: () => { navigate("/") } }
    ];

    const editOptions = [
        // { label: "Undo", type: "button", action: () => { } },
        // { label: "Redo", type: "button", action: () => { } },
        // { label: "Copy", type: "button", action: () => { } },
        // { label: "Cut", type: "button", action: () => { } },
        // { label: "Paste", type: "button", action: () => { } },
        // { label: "Scale image", type: "button", action: () => { } },
        // { label: "Resize canvas", type: "button", action: () => { } }
    ];

    const viewOptions = [
        {
            label: "Zoom in", type: "button", action: () => {
                setZoomLevel(Math.min(zoomLevel * 2, 8));
                zoomRef.current = Math.min(zoomRef.current * 2, 8);
            }
        },
        {
            label: "Zoom out", type: "button", action: () => {
                setZoomLevel(Math.max(zoomLevel / 2, 0.25));
                zoomRef.current = Math.max(zoomRef.current / 2, 0.25);
            }
        },
        {
            label: "Revert zoom", type: "button", action: () => {
                setZoomLevel(1);
                zoomRef.current = 1;
            }
        },
        // { label: "Toggle grid", type: "button", action: () => { } },
        // { label: "Set grid size", type: "button", action: () => { } },
        // { label: "Snap to grid", type: "button", action: () => { } }
    ];

    const paletteOptions = [
        {
            label: "Save palette", type: "button", action: () => {
                savePalette(drawing.current.palette, token, "PUT")
            }
        },
        { label: "Save palette as...", type: "button", action: paletteSaveMenu },
        { label: "Switch palette", type: "button", action: () => { } },
        {
            label: "Select as default", type: "button", action: () => {
                if (drawing.current.palette.universal) {
                    setMessage("Please save the palette before setting it as your default.")
                    // I should have an endpoint for this
                    // I do need to set all other palettes to non-default
                }
            }
        },
        // { label: "Resize to 4x4", type: "button", action: () => { } },
        // { label: "Resize to 8x8", type: "button", action: () => { } },
        // { label: "Resize to 16x16", type: "button", action: () => { } }
    ];

    const settingsOptions = [
        // { label: "Color mode", type: "button", action: () => { } },
        // { label: "Save actions", type: "button", action: () => { } }
    ];

    const drawingTools = ["Pencil", "Dotter", "Bucket", "Eraser", "Dithering pencil", "Dithering bucket"];
    const geometryTools = ["Line", "Rectangle", "Fill rectangle", "Ellipse", "Fill ellipse"];


    function downloadImage(event) {
        // Downloads canvas image as a png
        let url = canvasRef.current.toDataURL("image/png");
        let a = docRef.current.createElement("a");
        a.href = url;
        a.download = "Testfile.png";
        a.click();
    }

    function imageSaveMenu() {
        setFile({
            mode: "Save image", action: (name, folder, overwriteId) => {
                drawing.current.name = name;
                drawing.current.folder_id = folder.id;

                if (overwriteId) {
                    drawing.current.id = overwriteId;
                    saveImage(drawing.current, token, "PUT");
                }
                else saveImage(drawing.current, token, "POST");
            }
        });
    }


    function imageOpenMenu() {
        setFile({
            mode: "Open image", action: (image) => {
                openImage(image.id, token);
                openPalette(drawing.current.palette_id, token);
            }
        })
    }


    async function saveLayer(layer, token, method) {
        // Saves the image layer
        try {
            let path;

            let body = {
                content: layer.indexedColors, image_id: layer.image_id,
                order: layer.order
            }

            if (method === "PUT") path = `http://localhost:8000/v1/layer/${layer.id}`;
            else if (method === "POST") path = `http://localhost:8000/v1/layer`;
            else return;

            const response = await fetch(path,
                {
                    method: method,
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                });
            const data = await response.json();

            if (response.ok) {
                setFile(null);
                setMessage("Image saved successfully!");
                drawing.current.image.id = data.id;
                return data;
            }
            else throw new Error("Error when saving image");
        }
        catch (error) {
            console.log(error);
            setFile(null);
            setMessage("An error occurred when attempting to save image.");
        }
    }

    async function saveImage(image, token, method) {
        // Saves the current image
        try {
            let path;
            let body = {
                name: image.name, width: image.width, height: image.height,
                folder_id: image.folder_id, palette_id: image.palette_id
            };

            if (method === "PUT") path = `http://localhost:8000/v1/image/${image.id}`;
            else if (method === "POST") path = `http://localhost:8000/v1/image`;
            else return;

            const response = await fetch(path,
                {
                    method: method,
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                });
            const data = await response.json();

            if (response.ok) {
                drawing.current.id = data.id;
                drawing.current.image.image_id = data.id;
                saveLayer(drawing.current.image, token, method);
            }
            else throw new Error("Error when saving image");
        }
        catch (error) {
            console.log(error);
            setFile(null);
            setMessage("An error occurred when attempting to save image.");
        }
    }


    function paletteSaveMenu() {
        setFile({
            mode: "Save palette",
            action: (name, folder, overwriteId) => {
                drawing.current.palette.name = name;
                drawing.current.palette.folder_id = folder.id;

                if (overwriteId) {
                    drawing.current.palette.id = overwriteId;
                    savePalette(drawing.current.palette, token, "PUT");
                }
                else savePalette(drawing.current.palette, token, "POST");
            }
        });
    }


    async function saveColors(colors, token, method, paletteId) {
        // Saves the current palette colors
        try {
            let path;

            if (method === "PUT") path = `http://localhost:8000/v1/colors/${paletteId}`;
            else if (method === "POST") {
                path = `http://localhost:8000/v1/colors/${paletteId}`;
                palette.universal = false;
            }
            else return;

            const response = await fetch(path,
                {
                    method: method,
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(colors)
                });
            const data = await response.json();

            if (response.ok) {
                setFile(null);
                setMessage("Palette saved successfully!");
            }
            else throw new Error("Error when saving palette");
        }
        catch (error) {
            console.log(error);
            setFile(null);
            setMessage("An error occurred when attempting to save palette.");
        }
    }


    async function savePalette(palette, token, method) {
        // Saves the current palette
        try {
            let path;

            if (method === "PUT") path = `http://localhost:8000/v1/palette/${palette.id}`;
            else if (method === "POST") {
                path = `http://localhost:8000/v1/palette`;
                palette.universal = false;
                palette.default_palette = false;
            }
            else return;

            const response = await fetch(path,
                {
                    method: method,
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(palette)
                });
            const data = await response.json();

            if (response.ok) {
                palette.id = data.id;
                saveColors(palette.colors, token, method, data.id);
                return data;
            }
            else throw new Error("Error when saving palette");
        }
        catch (error) {
            console.log(error);
            setFile(null);
            setMessage("An error occurred when attempting to save palette.");
        }
    }


    async function openPalette(id, token) {
        // Returns a palette with a specific id or the users default palette 
        try {
            let path = (id === null) ? "http://localhost:8000/v1/default_palette" : `http://localhost:8000/v1/palette/${id}`;

            const response = await fetch(path,
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });
            const data = await response.json();

            if (!response.ok) throw new Error("Error when fetching palette");

            let palette = new Palette(data);
            let colors = palette.getColors();
            drawing.current.setPalette(palette);
            setPalette(colors);
            // The primary and secondary colors have to be fetched from the palette
            // Color 0 and 7 are kind of random but they'll do for now
            setPrimaryColor(new PaletteColor(colors[0].red, colors[0].green, colors[0].blue,
                colors[0].index, colors[0].order));
            setSecondaryColor(new PaletteColor(colors[7].red, colors[7].green,
                colors[7].blue, colors[7].index, colors[7].order));
            primaryCRef.current = new PaletteColor(colors[0].red, colors[0].green, colors[0].blue,
                colors[0].index, colors[0].order);
            secondaryCRef.current = new PaletteColor(colors[7].red, colors[7].green,
                colors[7].blue, colors[7].index, colors[7].order);
            return palette;
        }
        catch {
            return false;
        }
    }


    async function openImage(id, token) {
        // Opens an image
        try {
            let path = `http://localhost:8000/v1/image/${id}`;

            const response = await fetch(path,
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });
            const data = await response.json();

            if (!response.ok) throw new Error("Error when fetching image");

            let layer = data.layers[0];

            drawing.current = new Drawing(width = data.width, height = data.height,
                palette_id = data.palette_id, folder_id = data.folder_id,
                image_name = data.name, order = data.order, version = data.version);
            drawing.current.image = new ImageLayer(x = 0, y = 0, width = data.width, height = data.height, order = 0, id = layer.id);
            drawing.current.image.indexedColors = layer.content;
        }
        catch {
            setFile(null);
            setMessage("An error occurred when attempting to open the image.")
            return false;
        }
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
        // Sets active drawing tool
        setTool(event.target.id);
        activeTool.current.tool = event.target.id;
    }

    function onPaletteClick(event, index, order, color) {
        // Sets primary color to equal a palette color
        let red = hexToColor(color, 0);
        let green = hexToColor(color, 1);
        let blue = hexToColor(color, 2);
        let pColor = new PaletteColor(red, green, blue, index, order);
        setPrimaryColor(pColor);
        primaryCRef.current = pColor;
    }

    function onPaletteRightClick(event, index, order, color) {
        // Sets secondary color to equal a palette color
        let red = hexToColor(color, 0);
        let green = hexToColor(color, 1);
        let blue = hexToColor(color, 2);
        let pColor = new PaletteColor(red, green, blue, index, order);
        setSecondaryColor(pColor);
        secondaryCRef.current = pColor;
    }

    function previewPrimaryColor(red, green, blue) {
        // Changes the primary color
        // Applies to primary color display and color picker
        // Does not apply to palette, image or drawings
        let color = new PaletteColor(red, green, blue, primaryColor.index, primaryColor.order);
        setPrimaryColor(color);
        primaryCRef.current = color;
    }

    function previewSecondaryColor(red, green, blue) {
        // Changes the secondary color
        // Applies to secondary color display and color picker
        // Does not apply to palette, image or drawings
        let color = new PaletteColor(red, green, blue, secondaryColor.index, secondaryColor.order);
        setSecondaryColor(color);
        secondaryCRef.current = color;
    }

    function modifyPrimaryColor(red, green, blue, index, order) {
        // Changes the primary color
        // Applies to palette and drawings
        red = Math.max(Math.min(Number(red), 255), 0);
        green = Math.max(Math.min(Number(green), 255), 0);
        blue = Math.max(Math.min(Number(blue), 255), 0);
        let color = rgbToHex(red, green, blue);

        drawing.current.changeColor(canvasRef.current.getContext("2d"),
            index, order, red, green, blue);

        setPalette(drawing.current.palette.getColors());

        if (activeTool.current.colorIndex === index) activeTool.current.color = color;
    }

    function modifySecondaryColor(red, green, blue, index, order) {
        // Changes the secondary color
        // Applies to palette and drawings
        red = Math.max(Math.min(Number(red), 255), 0);
        green = Math.max(Math.min(Number(green), 255), 0);
        blue = Math.max(Math.min(Number(blue), 255), 0);
        let color = rgbToHex(red, green, blue);

        drawing.current.changeColor(canvasRef.current.getContext("2d"),
            index, order, red, green, blue);
        setPalette(drawing.current.palette.getColors());

        if (activeTool.current.colorIndex === index) activeTool.current.color = color;
    }

    function getStart(x1, x2) {
        // Returns the minimum of two x or y coordinates
        return Math.min(x1, x2);
    }

    function getLineStart(x1, x2) {
        // Returns a starting line coordinate with respect to either x or y
        // Assumes drawing is done in a box with top left corner 0,0
        if (x2 > x1) return 0;
        else return x1 - x2;
    }

    function getLineEnd(x1, x2) {
        // Returns a starting line coordinate with respect to either x or y
        // Assumes drawing is done in a box with top left corner 0,0
        if (x2 > x1) return x2 - x1;
        else return 0;
    }

    function getSquareStart(x1, x2, distance) {
        // Gets a starting coordinate with respect to either x or y,
        // from which to draw a square or circle with side equal to distance.
        // The coordinates doesn't have to describe a square area
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

            if (drawingTools.includes(activeTool.current.tool)) {
                const context = canvasRef.current.getContext("2d");

                if (activeTool.current.tool === "Pencil" || activeTool.current.tool === "Eraser") {
                    drawing.current.addToDrawing(context, overlayRef.current, activeTool.current,
                        getLine(lastPoint[0], lastPoint[1],
                            currentPoint[0], currentPoint[1]));
                }
                else if (activeTool.current.tool === "Dotter") {
                    drawing.current.addToDrawing(context, overlayRef.current, activeTool.current,
                        getDot(currentPoint[0], currentPoint[1]));
                }
            }
            else if (geometryTools.includes(activeTool.current.tool)) {
                const context = overlayRef.current.getContext("2d");
                let startX = getStart(startPoint[0], currentPoint[0]);
                let startY = getStart(startPoint[1], currentPoint[1]);
                let dx = getLength(startPoint[0], currentPoint[0]);
                let dy = getLength(startPoint[1], currentPoint[1]);

                if (activeTool.current.tool === "Line") {
                    if (shiftDown) {
                        drawing.current.previewGeometry(context, activeTool.current,
                            getStraightLine(getLineStart(startPoint[0], currentPoint[0]),
                                getLineStart(startPoint[1], currentPoint[1]),
                                getLineEnd(startPoint[0], currentPoint[0]),
                                getLineEnd(startPoint[1], currentPoint[1])),
                            startX, startY, dx, dy);
                    }
                    else {
                        drawing.current.previewGeometry(context, activeTool.current,
                            getLine(getLineStart(startPoint[0], currentPoint[0]),
                                getLineStart(startPoint[1], currentPoint[1]),
                                getLineEnd(startPoint[0], currentPoint[0]),
                                getLineEnd(startPoint[1], currentPoint[1])),
                            startX, startY, dx, dy);
                    }
                }
                else if (activeTool.current.tool === "Rectangle") {
                    if (shiftDown) {
                        let distance = Math.min(dx, dy);
                        drawing.current.previewGeometry(context, activeTool.current,
                            getRectangle(0, 0, distance - 1, distance - 1),
                            getSquareStart(startPoint[0], currentPoint[0], distance),
                            getSquareStart(startPoint[1], currentPoint[1], distance),
                            distance, distance);
                    }
                    else {
                        drawing.current.previewGeometry(context, activeTool.current,
                            getRectangle(0, 0, dx - 1, dy - 1),
                            startX, startY, dx, dy);
                    }
                }
                else if (activeTool.current.tool === "Fill rectangle") {
                    if (shiftDown) {
                        let distance = Math.min(dx, dy);
                        drawing.current.previewGeometry(context, activeTool.current,
                            fillRectangle(0, 0, distance - 1, distance - 1),
                            getSquareStart(startPoint[0], currentPoint[0], distance),
                            getSquareStart(startPoint[1], currentPoint[1], distance),
                            distance, distance);
                    }
                    else {
                        drawing.current.previewGeometry(context, activeTool.current,
                            fillRectangle(0, 0, dx - 1, dy - 1),
                            startX, startY, dx, dy);
                    }
                }
                else if (activeTool.current.tool === "Ellipse") {
                    if (shiftDown) {
                        let distance = Math.min(dx, dy);
                        drawing.current.previewGeometry(context, activeTool.current,
                            getCircle(0, 0, distance - 1, distance - 1),
                            getSquareStart(startPoint[0], currentPoint[0], distance),
                            getSquareStart(startPoint[1], currentPoint[1], distance),
                            distance, distance);
                    }
                    else {
                        drawing.current.previewGeometry(context, activeTool.current,
                            getEllipse(0, 0, dx - 1, dy - 1),
                            startX, startY, dx, dy);
                    }
                }
                else if (activeTool.current.tool === "Fill ellipse") {
                    if (shiftDown) {
                        let distance = Math.min(dx, dy);
                        drawing.current.previewGeometry(context, activeTool.current,
                            fillEllipse(0, 0, distance - 1, distance - 1),
                            getSquareStart(startPoint[0], currentPoint[0], distance),
                            getSquareStart(startPoint[1], currentPoint[1], distance),
                            distance, distance);
                    }
                    else {
                        drawing.current.previewGeometry(context, activeTool.current,
                            fillEllipse(0, 0, dx - 1, dy - 1),
                            startX, startY, dx, dy);
                    }
                }
            }
        }
        lastPoint = [...currentPoint];

        if (currentPoint[0] >= 0 && currentPoint[0] < canvasWidth
            && currentPoint[1] >= 0 && currentPoint[1] < canvasHeight) {
            setCoordinates([...currentPoint]);
        }
        else {
            setCoordinates([null, null]);
        }
        loopId = requestAnimationFrame(drawingLoop);
    }

    // Apparently, using useCallback can prevent unnecessary re-renders
    const onMove = useCallback((event) => {
        // Called on mouse movement
        let rect = canvasRef.current.getBoundingClientRect();
        let x = Math.round((event.clientX - rect.left) / zoomRef.current);
        let y = Math.round((event.clientY - rect.top) / zoomRef.current);
        shiftDown = (event.shiftKey) ? true : false;
        currentPoint = [x, y];

        if (menuOpen.current && menu !== event.target.id && menuLabels.includes(event.target.id)) {
            setMenu(event.target.id);
        }
    }, []);

    function setToolColor(color) {
        // Set active color to a palette color
        activeTool.current.red = color.red;
        activeTool.current.green = color.green;
        activeTool.current.blue = color.blue;
        activeTool.current.alpha = 255;
        activeTool.current.colorIndex = color.index;
    }

    function setToolErase() {
        // Set active color to full transparency
        activeTool.current.alpha = 0;
        activeTool.current.colorIndex = -1;
    }


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

                if (activeTool.current.tool === "Eraser") setToolErase();
                else setToolColor(primaryCRef.current);
            }
            else if (event.button === 2 && !canvasLeftDown) {
                canvasRightDown = true;

                if (activeTool.current.tool === "Eraser") setToolErase();
                else setToolColor(secondaryCRef.current);
            }

            if (activeTool.current.tool === "Bucket" && (canvasRightDown || canvasLeftDown)) {
                drawing.current.fillWithColor(canvasRef.current.getContext("2d", { willReadFrequently: true }),
                    activeTool.current, x, y);
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


    useEffect(() => {
        // Sets up mouse listeners and main loop
        // Sets up the drawing class
        docRef.current.addEventListener("mousemove", onMove);
        docRef.current.addEventListener("mousedown", onDown);
        docRef.current.addEventListener("mouseup", onRelease);

        window.oncontextmenu = (event) => { event.preventDefault() }
        openPalette(null, token);

        // I don't need to draw but I do need to set that willReadFrequently option
        // If I don't do that now it might be too late
        let context = canvasRef.current.getContext("2d", { willReadFrequently: true });
        loopId = requestAnimationFrame(drawingLoop);
        drawing.current.setImage();
        drawing.current.setPreview();

        return () => {
            docRef.current.removeEventListener("mousemove", onMove);
            docRef.current.removeEventListener("mousedown", onDown);
            docRef.current.removeEventListener("mouseup", onRelease);
            cancelAnimationFrame(loopId);
        }
    }, []);

    return <div className="flex flex-col min-h-screen max-h-screen bg-gray-50">
        {message && <MessageWindow action={(event) => setMessage("")}>{message}</MessageWindow>}
        {file && <div className="absolute z-30 h-[480px] w-[480px] top-[50%] left-[50%] translate-[-50%]">
            <FileSystem
                mode={file.mode}
                action={file.action}
                onCancel={() => setFile(null)}>
            </FileSystem>
        </div>
        }
        <div className="flex border-b border-b-gray-300">
            <nav>
                <ul className="flex ml-3 mt-1 text-lg font-mercutio">
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
                            id="Palette"
                            onClick={onMenuOpen}
                            className="hover:bg-gray-200 pt-1 pb-2 px-3">Palette
                        </button>
                        {menu == "Palette" && <Menu options={paletteOptions}></Menu>}
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
        {/* Needed min-h-full to lower height and enforce scroll */}
        <div className="flex grow min-h-full min-w-full">
            <div className="flex flex-col border-r border-gray-300 bg-white">
                <nav>
                    <ul className="grid grid-cols-2 text-xs p-1 m-1 bg-white border-y border-gray-300">
                        <ToolButton name="Pencil" icon={"images/Pencil.png"} selectedTool={tool} onClick={onToolSelect}></ToolButton>
                        <ToolButton name="Dotter" icon={"images/Dotter.png"} selectedTool={tool} onClick={onToolSelect}></ToolButton>
                        <ToolButton name="Bucket" icon={"images/Bucket.png"} selectedTool={tool} onClick={onToolSelect}></ToolButton>
                        <ToolButton name="Eraser" icon={"images/Eraser.png"} selectedTool={tool} onClick={onToolSelect}></ToolButton>
                    </ul>
                </nav>
                <nav>
                    <ul className="grid grid-cols-2 text-xs p-1 m-1 bg-white border-y border-gray-300">
                        <ToolButton name="Line" icon={"images/Line.png"} selectedTool={tool} onClick={onToolSelect}></ToolButton>
                        <ToolButton name="Rectangle" icon={"images/Rectangle.png"} selectedTool={tool} onClick={onToolSelect}></ToolButton>
                        <ToolButton name="Fill rectangle" icon={"images/Filled rectangle.png"} selectedTool={tool} onClick={onToolSelect}></ToolButton>
                        <ToolButton name="Ellipse" icon={"images/Circle.png"} selectedTool={tool} onClick={onToolSelect}></ToolButton>
                        <ToolButton name="Fill ellipse" icon={"images/Filled circle.png"} selectedTool={tool} onClick={onToolSelect}></ToolButton>
                    </ul>
                </nav>
            </div>
            {/* Box-sizing and -4 positioning ensures border can be fully covered by canvas */}
            <div className="flex flex-col grow items-center overflow-scroll bg-gray-300">
                <div className="bg-gray-300"
                    style={{ width: canvasWidth * zoomLevel + 60, height: 60 }}></div>
                <div
                    className="relative bg-gray-300 box-border border-4 border-dashed border-gray-200"
                    style={{ width: canvasWidth * zoomLevel, height: canvasHeight * zoomLevel }}>
                    <canvas
                        id="canvas"
                        ref={canvasRef}
                        width={canvasWidth}
                        height={canvasHeight}
                        style={{ width: canvasWidth * zoomLevel, height: canvasHeight * zoomLevel }}
                        className="absolute top-[-4px] left-[-4px] w-[300px] h-[300px] z-0">
                    </canvas>
                    <canvas
                        id="overlay"
                        ref={overlayRef}
                        width={canvasWidth}
                        height={canvasHeight}
                        style={{ width: canvasWidth * zoomLevel, height: canvasHeight * zoomLevel }}
                        className="absolute top-[-4px] left-[-4px] w-[300px] h-[300px] z-10">
                    </canvas>
                </div>
                <div className="bg-gray-300"
                    style={{ width: canvasWidth * zoomLevel + 60, height: 60 }}></div>
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
        <div className="flex flex-row-reverse text-xs border-t border-t-gray-300 h-7">
            {coordinates[0] !== null &&
                <div className="flex m-1 mr-3">
                    ({coordinates[0]}, {coordinates[1]})
                </div>}
        </div>
    </div>
}