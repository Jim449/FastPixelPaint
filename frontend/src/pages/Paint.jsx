import React, { useState, useEffect, useRef, useCallback } from "react"

export default function Paint() {
    const [width, setWidth] = useState(400);
    const [height, setHeight] = useState(400);
    const [coordinates, setCoordinates] = useState([0, 0]);
    const [palette, setPalette] = useState([]);
    const canvasRef = useRef();
    const docRef = useRef(document);

    let canvasLeftDown = false;
    let canvasRightDown = false;
    let lastPoint = [0, 0];
    let currentPoint = [0, 0];
    let loopId;

    // Drawing in here rather than in mousemove event should be cheaper
    function drawingLoop(time) {
        // A drawing loop, called at 60 FPS or so
        if (canvasLeftDown) {
            const context = canvasRef.current.getContext("2d");
            context.strokeStyle = "black";
            context.lineWidth = 1;
            context.moveTo(lastPoint[0], lastPoint[1]);
            context.lineTo(currentPoint[0], currentPoint[1]);
            context.closePath();
            context.stroke();
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
    }, []);

    const onDown = useCallback((event) => {
        // Called on mouse press
        if (event.target.id === "canvas") {
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
        console.log(colors);
        setPalette(colors);
        loopId = requestAnimationFrame(drawingLoop);

        return () => {
            docRef.current.removeEventListener("mousemove", onMove);
            docRef.current.removeEventListener("mousedown", onDown);
            docRef.current.removeEventListener("mouseup", onRelease);
            cancelAnimationFrame(loopId);
        }
    }, [])

    return <div className="flex flex-col max-h-screen bg-gray-50">
        <div className="flex rounded-b-lg border-b border-b-gray-300">
            <nav>
                <ul className="flex text-sm ml-3 my-1 gap-3">
                    <li>File</li>
                    <li>Edit</li>
                    <li>View</li>
                    <li>Settings</li>
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
                <div className="bg-gray-300 w-[460px] min-h-[60px]"></div>
                <canvas
                    id="canvas"
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="w-[400px] h-[400px]">
                </canvas>
                <div className="bg-gray-300 w-[460px] min-h-[60px]"></div>
            </div>
            <div className="flex flex-col">
                <div className="grid grid-cols-16 gap-0 m-2">
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