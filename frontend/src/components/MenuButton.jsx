import React from "react";

export default function MenuButton(option) {
    return <li><button
        className="hover:underline text-sm"
        onClick={option.action}>{option.label}
    </button></li>
}