import React, { useState, useEffect, useRef, useCallback } from "react"

export default function Paint() {
    const [width, setWidth] = useState(400);
    const [height, setHeight] = useState(400);
    const [coordinates, setCoordinates] = useState([0, 0]);
    const [palette, setPalette] = useState([]);
    const canvasRef = useRef();


    let leftCanvasDown = false;
    let rightCanvasDown = false;

    // When switching to javascript dom, you'll have to be careful not to manipulate dom
    // React won't be able to react! But if I don't add/remove children it should be fine
    // Apparently, using useCallback can prevent unnecessary re-renders
    const onMove = useCallback((event) => {
        let rect = event.target.getBoundingClientRect();
        // I get -1 sometimes. That's no good!
        let x = Math.round(event.clientX - rect.left);
        let y = Math.round(event.clientX - rect.left);
        setCoordinates([Math.round(event.clientX - rect.left), Math.round(event.clientY - rect.top)]);
    }, []);

    const onDown = useCallback((event) => {
        leftCanvasDown = true;
    }, []);

    const onRelease = useCallback((event) => {
        leftCanvasDown = false;
    }, []);

    useEffect(() => {
        canvasRef.current.addEventListener("mousemove", onMove);
        canvasRef.current.addEventListener("mousedown", onDown);
        canvasRef.current.addEventListener("mouseup", onRelease);

        // Replace later
        let colors = [];

        for (let i = 0; i < 16 * 16; i++) {
            colors.push("Some color");
        }
        setPalette(colors);

        return () => {
            canvasRef.current.removeEventListener("mousemove", onMove);
            canvasRef.current.removeEventListener("mousedown", onDown);
            canvasRef.current.removeEventListener("mouseup", onRelease);
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
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="bg-white w-[400px] h-[400px]">
                </canvas>
                <div className="bg-gray-300 w-[460px] min-h-[60px]"></div>
            </div>
            <div className="flex flex-col">
                <div className="grid grid-cols-16 gap-0 m-2">
                    {palette.map((color) => <div className="size-3 bg-red-800 border border-t-gray-800 border-l-gray-800 border-b-gray-300 border-r-gray-300"></div>)}
                </div>
                <div className="flex">
                    Active colors
                </div>
                <div className="flex flex-col">
                    Layers
                </div>
            </div>
        </div>
        <div className="flex flex-row-reverse text-sm border-t border-t-gray-300">
            <div className="flex m-1">
                ({coordinates[0]}, {coordinates[1]})
            </div>
        </div>
    </div>
}