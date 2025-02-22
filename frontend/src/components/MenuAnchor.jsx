import React from "react";

export default function MenuAnchor({ option }) {
    return <li><button><a
        className="hover:underline text-sm"
        href={option.url}
        download={option.download}>{option.label}
    </a></button></li>
}