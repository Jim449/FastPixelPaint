import React, { useState } from "react"

export default function Paint() {
    const [width, setWidth] = useState(400);
    const [height, setHeight] = useState(400);

    return <div className="flex flex-col h-screen">
        <div className="flex h-1/10">
            <nav>
                <ul className="flex ml-3 gap-3">
                    <li>File</li>
                    <li>Edit</li>
                    <li>View</li>
                    <li>Settings</li>
                </ul>
            </nav>
        </div>
        <div className="flex flex-row h-1/10">
            <nav>
                <ul className="flex flex-row text-xs p-1 gap-1 border border-gray-100">
                    <li>Pencil</li>
                    <li>Brush</li>
                    <li>Fill</li>
                    <li>Eraser</li>
                </ul>
            </nav>
            <nav>
                <ul className="flex flex-row text-xs p-1 gap-1 border border-gray-100">
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
        <div className="flex h-7/10">
            <div className="flex flex-col items-center w-[80%] overflow-scroll">
                <div className="bg-white w-[460px] min-h-[60px]"></div>
                <canvas
                    width={width}
                    height={height}
                    className="bg-amber-200 w-[400px] h-[400px]">
                </canvas>
                <div className="bg-white w-[460px] min-h-[60px]"></div>
            </div>
            <div className="flex flex-col w-[20%]">
                <div className="grid">
                    Palette
                </div>
                <div className="flex">
                    Active colors
                </div>
                <div className="flex flex-col">
                    Layers
                </div>
            </div>
        </div>
        <div className="flex h-1/10">
            Status bar
        </div>
    </div>
}