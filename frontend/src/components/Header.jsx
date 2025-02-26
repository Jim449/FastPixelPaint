import React from "react"
import { Link } from "react-router"

export default function Header() {
    return <div className="flex">
        <nav>
            <ul>
                <li>Home</li>
                <li><Link to="paint">Paint</Link></li>
                <li>About</li>
            </ul>
        </nav>
    </div>
}