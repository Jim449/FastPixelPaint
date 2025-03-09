import React from "react"
import "src/index.css"

export default function ColorPicker({ color, previewColor, setColor, colorType }) {

    function setRed(event) {
        let red = Math.max(Number(event.target.value), 0);
        red = Math.min(red, 255);
        previewColor(red, color.green, color.blue);
    }

    function setGreen(event) {
        let green = Math.max(Number(event.target.value), 0);
        green = Math.min(green, 255);
        previewColor(color.red, green, color.blue);
    }

    function setBlue(event) {
        let blue = Math.max(Number(event.target.value), 0);
        blue = Math.min(blue, 255);
        previewColor(color.red, color.green, blue);
    }

    return <div className="flex flex-col">
        <div className="flex">
            <div
                className="w-[128px] h-[10px] m-1 border border-gray-300 relative"
                style={{ backgroundImage: `linear-gradient(in srgb to right, ${color.no_red}, ${color.color} ${color.red_quota}, ${color.full_red})` }}>
                <input
                    className="w-[128px] h-0 m-1 absolute -left-[5px] top-[1px] rangeslider"
                    type="range"
                    id={`${colorType}-red-range`}
                    min="0"
                    max="255"
                    value={color.red}
                    onChange={setRed}>
                </input>
            </div>
            <input
                className="text-xs"
                type="number"
                id={`${colorType}-red-value`}
                min="0"
                max="255"
                step="1"
                value={color.red}
                onChange={setRed}>
            </input>
        </div>
        <div className="flex">
            <div
                className="w-[128px] h-[10px] m-1 border border-gray-300 relative"
                style={{ backgroundImage: `linear-gradient(in srgb to right, ${color.no_green}, ${color.color} ${color.green_quota}, ${color.full_green})` }}>
                <input
                    className="w-[128px] h-0 m-1 absolute -left-[5px] top-[1px] rangeslider"
                    type="range"
                    id={`${colorType}-green-range`}
                    min="0"
                    max="255"
                    value={color.green}
                    onChange={setGreen}>
                </input>
            </div>
            <input
                className="text-xs"
                type="number"
                id={`${colorType}-green-value`}
                min="0"
                max="255"
                step="1"
                value={color.green}
                onChange={setGreen}>
            </input>
        </div>
        <div className="flex">
            <div
                className="w-[128px] h-[10px] m-1 border border-gray-300 relative"
                style={{ backgroundImage: `linear-gradient(in srgb to right, ${color.no_blue}, ${color.color} ${color.blue_quota}, ${color.full_blue})` }}>
                <input
                    className="w-[128px] h-0 m-1 absolute -left-[5px] top-[1px] rangeslider"
                    type="range"
                    id={`${colorType}-blue-range`}
                    min="0"
                    max="255"
                    value={color.blue}
                    onChange={setBlue}>
                </input>
            </div>
            <input
                className="text-xs"
                type="number"
                id={`${colorType}-blue-value`}
                min="0"
                max="255"
                step="1"
                value={color.blue}
                onChange={setBlue}>
            </input>
        </div>
        <button
            className="m-2 w-36 text-xs p-1 border border-gray-300 cursor-pointer"
            onClick={() => setColor(color.red, color.green, color.blue, color.index, color.order)}>{`Set ${colorType} color`}
        </button>
    </div>
}