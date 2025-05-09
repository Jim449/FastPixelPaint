import React from "react";
import MenuButton from "src/components/MenuButton";

export default function Menu({ options }) {

    return <ul className="absolute z-30 top-full left-0 bg-gray-50 border border-gray-300">
        {options.map((option) => <MenuButton key={"menu-" + option.label} option={option}></MenuButton>)}
    </ul>
}