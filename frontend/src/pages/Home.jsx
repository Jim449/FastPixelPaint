import React from "react"
import { Link } from "react-router-dom"

export default function Home() {
    return <div className="flex flex-col self-center w-[70%]">
        <div className="p-4 mt-2 bg-white place-items-center border border-gray-100">
            <img src="images/Sloppy MS paint drawing.png"></img>
        </div>
        <p className="pl-1 pt-1 text-xs">This sloppy picture was made in 5 minutes with MS Paint and certainly not with this nice program. It will be replaced soon.</p>
        <p className="pl-1 pt-1 text-xs">Try out a fancy pixel font. Return of Ganon doesn't feel like a header font. Manaspace is so elongated. Mercutio is decent, maybe not the smallcaps. Teeny tiny pixls is a mess but kind of funny. Crumbled pixels is cool:</p>
        <h1 className="text-6xl mx-auto p-6 font-[Crumbled_pixels]">Fast pixel paint</h1>
        <p className="pl-1 pt-1 text-xs">Default is Segoe UI. Lato is similar but more compressed, which is nice. I want to try jersey 15 charted on buttons but it's not working yet.</p>
        <p className="p-2 font-[Lato]">A web program for creating pixel art.
            Fast pixel paint currently supports most of the basic drawing methods.
            More functions will be implemented shortly.
        </p>
        <p className="p-2">In order to make use of all functions, you need to register an account.
            You can do this for free.
            With an account, you can save your images while retaining layers
            and palettes.
        </p>
        <div className="p-4 mx-auto">
            <Link
                to="register"
                className="text-2xl font-['Jersey_15_Charted'] shadow-md shadow-gray-300 hover:shadow-none">Register</Link>
        </div>
        <p className="p-2">Even if you don't log in, you can create an image
            and export it to a png format. Try it out.
        </p>
        <div className="p-4 mx-auto">
            <Link
                to="paint"
                className="text-2xl font-['Jersey_15_Charted'] shadow-md shadow-gray-300 hover:shadow-none">Open painter</Link>
        </div>
    </div>
}