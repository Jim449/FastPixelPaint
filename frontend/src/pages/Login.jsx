import React from "react"
import LoginForm from "src/components/LoginForm"
import { useNavigate } from "react-router-dom"


export default function Login() {
    const navigate = useNavigate();

    function toRoot(data) {
        navigate(`/files`);
    }

    return <div className="flex flex-col self-center items-center w-[70%]">
        <h1 className="text-6xl mx-auto p-6 font-[Crumbled_pixels]">Login</h1>
        <LoginForm onLogin={toRoot}></LoginForm>
    </div>
}