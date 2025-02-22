import React from "react";
import MenuButton from "src/components/MenuButton";
import MenuAnchor from "src/components/MenuAnchor";

export default function Menu({ options }) {

    // return <ul className="absolute top-full left-0 w-full">{options.map((option) => {
    //     { option.type === "button" && <MenuButton option={option}></MenuButton> }
    //     { option.type === "anchor" && <MenuAnchor option={option}></MenuAnchor> }
    // })}
    // </ul>;

    return <ul className="absolute top-full left-0 bg-gray-50 border border-gray-300 text-sm">
        <li><button className="w-32 p-1 pl-2 text-left border border-gray-200">Option 1</button></li>
        <li><button className="w-32 p-1 pl-2 text-left border border-gray-200">Option 2</button></li>
        <li><button className="w-32 p-1 pl-2 text-left border border-gray-200">Option 3</button></li>
    </ul>
}