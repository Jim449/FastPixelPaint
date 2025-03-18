import React from "react"
import { useState } from "react";
import { useNavigate } from "react-router-dom"

export default function Registration() {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [serverError, setServerError] = useState("");
    let navigate = useNavigate();

    function validateEmail() {
        // Where [^\s@] means no whitespace or @
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) setEmailError("Email is required");
        else if (!regex.test(email)) setEmailError("Email must be correct");
        else setEmailError("");
    }

    function validatePassword() {
        const capital = /^[^A-Z]+$/;
        const number = /^[^0-9]+$/;
        const noSpecial = /^[\w]+$/;

        if (!password) setPasswordError("Password is required");
        else if (password.length < 8) setPasswordError("Password should have at least 8 characters");
        else if (capital.test(password)) setPasswordError("Password should include at least one capital letter");
        else if (number.test(password)) setPasswordError("Password should include at least one number");
        else if (noSpecial.test(password)) setPasswordError("Password should include at least one special character");
        else setPasswordError("");
    }

    async function onSubmit(event) {
        event.preventDefault();
        setServerError("");
        validateEmail();
        validatePassword();

        if (emailError.length > 0 || passwordError.length > 0) return;

        try {
            const response = await fetch("http://localhost:8000/v1/auth/register",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });
            const data = await response.json();

            if (response.status === 201) {
                navigate("/login")
            }
            else {
                setServerError("Registration failed due to unexpected error");
            }
        }
        catch {
            setServerError("Registration failed due to unexpected error");
        }
    }

    return <div className="flex flex-col self-center items-center w-[70%]">
        <h1 className="text-6xl mx-auto p-6 font-crumbled">Register an account</h1>
        <form className="bg-white border border-gray-300 rounded-lg w-80">
            <div className="flex flex-col p-3">
                <label
                    className="text-2xl font-mercutio"
                    htmlFor="email-field">Email</label>
                <input
                    id="email-field"
                    name="email-field"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onBlur={validateEmail}></input>
                {emailError && <p className="text-red-800 text-xs">{emailError}</p>}
            </div>
            <div className="flex flex-col p-3">
                <label
                    className="text-2xl font-mercutio"
                    htmlFor="password-field">Password</label>
                <input
                    id="password-field"
                    name="password-field"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Enter a password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onBlur={validatePassword}></input>
                {passwordError && <p className="text-red-800 text-xs">{passwordError}</p>}
            </div>
            <div className="flex flex-col p-3">
                <button
                    onClick={onSubmit}
                    className="cursor-pointer bg-gray-200 border border-gray-300 px-2 py-1"
                    type="submit">Register</button>
                {serverError && <p className="text-red-800 text-xs">{serverError}</p>}
            </div>
        </form>
    </div>
}