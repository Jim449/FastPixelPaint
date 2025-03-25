import React from "react"

export default function MessageWindow({ action, children }) {
    return <div className="absolute top-[50%] left-[50%] z-30 translate-[-50%] flex flex-col bg-gray-100 border border-gray-300 p-2 items-center">
        <p className="text-sm m-2">
            {children}
        </p>
        <button
            className="text-sm border border-gray-300 py-1 px-2 m-2 cursor-pointer"
            onClick={action}>OK
        </button>
    </div>
}