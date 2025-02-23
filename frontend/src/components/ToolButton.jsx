import React from "react";

export default function ToolButton({ name, icon, selectedTool, onClick }) {

    return <button
        id={name}
        onClick={onClick}
        className={(name === selectedTool) ? "bg-gray-200 border border-gray-200 py-1 px-2" : "bg-gray-50 border border-gray-200 py-1 px-2"}>
        {name}
    </button>
}