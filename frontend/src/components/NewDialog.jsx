import React, { useState } from "react"

export default function NewDialog({ action, onCancel }) {

    const [newWidth, setNewWidth] = useState(300);
    const [newHeight, setNewHeight] = useState(300);

    return <div className="absolute top-[50%] left-[50%] z-30 translate-[-50%] flex flex-col bg-gray-100 border border-gray-300 p-2 items-center">
        <form className="flex flex-col">
            <label htmlFor="new-width text-sm">Width</label>
            <input
                type="number"
                id="new-width"
                name="new-width"
                min="1"
                max="1000"
                step="1"
                value={newWidth}
                onChange={(event) => setNewWidth(event.target.value)}>
            </input>
            <label htmlFor="new-width text-sm">Height</label>
            <input
                type="number"
                id="new-height"
                name="new-height"
                min="1"
                max="1000"
                step="1"
                value={newHeight}
                onChange={(event) => setNewHeight(event.target.value)}></input>
            <button
                className="text-sm border border-gray-300 py-1 px-2 m-2 cursor-pointer"
                onClick={action}>OK
            </button>
            <button
                className="text-sm border border-gray-300 py-1 px-2 m-2 cursor-pointer"
                onClick={onCancel}>Cancel
            </button>
        </form>
    </div>
}