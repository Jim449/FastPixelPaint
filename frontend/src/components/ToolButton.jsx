import React from "react";

export default function ToolButton({ name, icon, selectedTool, onClick }) {

    return <button
        id={name}
        onClick={onClick}
        className={(name === selectedTool) ? "box-content border border-gray-400 size-[30px]" : "box-content border border-white size-[30px]"}
        style={{ backgroundImage: `url('${icon}')` }}>
    </button>
}