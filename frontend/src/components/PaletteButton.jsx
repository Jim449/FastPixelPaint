import React from "react";

export default function PaletteButton({ color, index, order, action, rightClick }) {
    return <button
        className="size-3 border-1 border-t-gray-800 border-l-gray-800 border-b-gray-300 border-r-gray-300"
        onClick={(event) => { action(event, index, order, color) }}
        onContextMenu={(event) => { rightClick(event, index, order, color) }}
        id={"color-" + index}
        style={{ background: color }}>
    </button>
}