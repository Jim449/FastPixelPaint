import React from "react";

export default function PaletteButton({ color, index, action }) {
    return <button
        className="size-3 border-1 border-t-gray-800 border-l-gray-800 border-b-gray-300 border-r-gray-300"
        onClick={(event) => { action(event, index, color) }}
        id={"color-" + index}
        style={{ background: color }}>
    </button>
}