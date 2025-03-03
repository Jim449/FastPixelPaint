import React from "react"
import { Link } from "react-router-dom"

export default function Home() {
    return <div className="flex flex-col self-center w-[70%] font-[Return of Ganon Regular]">
        <div className="p-4 mt-2 bg-white place-items-center border border-gray-100">
            <img src="images/Sloppy MS paint drawing.png"></img>
        </div>
        <p className="pl-1 pt-1 text-xs">This sloppy picture was made in 5 minutes with MS Paint and certainly not with this nice program. It will be replaced soon.</p>
        <h1 className="text-4xl mx-auto p-6">Fast pixel paint</h1>
        <p className="p-2">A web program for creating pixel art.
            Fast pixel paint currently supports most of the basic drawing methods.
            More functions will be implemented shortly.
        </p>
        <p className="p-2">In order to make use of all functions, you need to register an account.
            You can do this for free.
            With an account, you can save your images while retaining layers
            and palettes.
        </p>
        <div className="p-4 mx-auto">
            <Link to="register">Register</Link>
        </div>
        <p className="p-2">Even if you don't log in, you can create an image
            and export it to a png format. Try it out.
        </p>
        <div className="p-4 mx-auto">
            <Link to="paint">Open painter</Link>
        </div>
    </div>
}