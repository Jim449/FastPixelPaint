import React from "react"
import { Link } from "react-router-dom"

export default function Home() {
    return <div className="flex flex-col bg-[url('images/Patterns.png')] bg-repeat">
        <div className="flex flex-col center justify-center background w-full h-[550px] bg-[url('images/Painter.PNG')] bg-cover border-b border-gray-300">
            <h1 className="text-6xl mx-auto p-6 font-crumbled">Fast pixel paint</h1>
            <Link
                to="paint"
                className="text-2xl border-2 border-gray-300 self-center text-center w-36 py-2 font-mercutio bg-gray-100">Start painting</Link>
        </div>
        <div className="flex flex-col w-[80%] self-center bg-gray-50 border-x border-gray-300">
            <div className="flex flex-col self-center w-[70%]">
                <h2 className="text-2xl mt-4 font-mercutio">A web program for pixel art</h2>
                <p className="mb-4 font">Fast pixel paint currently supports most of the basic drawing methods.
                    More functions will be implemented shortly.
                </p>
                <h2 className="text-2xl font-mercutio">Full control over colors</h2>
                <p className="mb-4">You can create your own palettes. If you change a color in the palette,
                    the image will be changed accordingly. Fast pixel paint will never introduce any colors you haven't defined.
                </p>
                <h2 className="text-2xl font-mercutio">Register an account</h2>
                <p className="mb-4">In order to make use of all functions, you need to register an account.
                    You can do this for free. With an account, you can save your images while retaining palettes.
                </p>
                <Link
                    to="register"
                    className="text-xl mb-4 text-center font-mercutio w-20 py-1 border border-black cursor-pointer">Register</Link>
            </div>
        </div>
    </div>
}