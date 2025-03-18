import React from "react"
import { Link, useNavigate } from "react-router"
import { authStore } from "src/store/authStore"

export default function Header() {
    // const logout = authStore((state) => state.logout);
    // const fetchUser = authStore((state) => state.fetchUser);
    // const userData = authStore((state) => state.userData);
    // const token = authStore((state) => state.token);
    // const navigate = useNavigate();

    // function logoutUser() {
    //     logout();
    //     navigate("home");
    // }

    // useEffect(() => {
    //     // Use the fetchUser from authstore
    // });

    return <div className="flex bg-gray-50 border-b border-gray-300">
        <nav className="flex flex-grow">
            <ul className="flex mx-3 pt-2 pb-2">
                <li><Link to=""
                    className="cursor-pointer hover:bg-gray-200 pt-1 pb-2 px-3 text-lg font-[Mercutio_NBP_Basic]">Home</Link></li>
                <li><Link to="paint"
                    className="cursor-pointer hover:bg-gray-200 pt-1 pb-2 px-3 text-lg font-[Mercutio_NBP_Basic]">Paint</Link></li>
                <li><Link to="files"
                    className="cursor-pointer hover:bg-gray-200 pt-1 pb-2 px-3 text-lg font-[Mercutio_NBP_Basic]">Files</Link></li>
                <li><Link to="about"
                    className="cursor-pointer hover:bg-gray-200 pt-1 pb-2 px-3 text-lg font-[Mercutio_NBP_Basic]">About</Link></li>
            </ul>
            <ul className="flex flex-grow justify-end mx-3 pt-2 pb-2">
                <li><Link to="login"
                    className="cursor-pointer hover:bg-gray-200 pt-1 pb-2 px-3 ml-auto text-lg font-[Mercutio_NBP_Basic]">Login</Link></li>
            </ul>
        </nav>
    </div>
}