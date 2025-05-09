import { Link, useNavigate } from "react-router"
import { authStore } from "src/store/authStore"

export default function Header() {
    const logout = authStore((state) => state.logout);
    const token = authStore((state) => state.token);
    const navigate = useNavigate();

    function logoutUser() {
        logout();
        navigate("/");
    }

    return <div className="flex bg-gray-50 border-b border-gray-300">
        <nav className="flex flex-grow">
            <ul className="flex mx-3 pt-2 pb-2">
                <li className="h-8">
                    <Link to=""
                        className="cursor-pointer hover:bg-gray-200 pt-1 pb-2 px-3 text-xl font-mercutio">Home</Link></li>
                <li className="h-8">
                    <Link to="paint"
                        className="cursor-pointer hover:bg-gray-200 pt-1 pb-2 px-3 text-xl font-mercutio">Paint</Link></li>
                {token && <li className="h-8">
                    <Link to="files"
                        className="cursor-pointer hover:bg-gray-200 pt-1 pb-2 px-3 text-xl font-mercutio">Files</Link></li>}
            </ul>
            <ul className="flex flex-grow justify-end mx-3 pt-2 pb-2">
                {!token && <li className="h-8">
                    <Link to="login"
                        className="cursor-pointer hover:bg-gray-200 pt-1 pb-2 px-3 ml-auto text-xl font-mercutio">Login</Link></li>}
                {token && <li className="h-8"><button
                    className="cursor-pointer hover:bg-gray-200 pt-1 pb-2 px-3 ml-auto text-xl font-mercutio"
                    onClick={logoutUser}>Logout</button></li>}
            </ul>
        </nav>
    </div>
}