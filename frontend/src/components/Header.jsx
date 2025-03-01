import React from "react"
import { Link, useNavigate } from "react-router"
// import { authStore } from "src/store/authStore"

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

    return <div className="flex">
        <nav>
            <ul>
                <li><Link to="home">Home</Link></li>
                <li><Link to="paint">Paint</Link></li>
                <li><Link to="about">About</Link></li>
                <li><Link to="login">Login</Link></li>
            </ul>
        </nav>
    </div>
}