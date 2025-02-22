import React from "react";

export default function MenuButton({ option }) {
    return <li><button
        className="w-40 p-1 pl-2 text-left border border-gray-200 hover:bg-gray-200"
        onClick={option.action}
        id={"menu-" + option.label}>
        {option.label}
    </button></li>
}