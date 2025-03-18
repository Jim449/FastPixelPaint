import React from "react";
import { useState } from "react";
import { authStore } from "src/store/authStore";

export default function LoginForm({ onLogin }) {

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [serverError, setServerError] = useState("");
    const { setToken } = authStore();
    const { setRoot } = authStore();


    function validateEmail() {
        // Where [^\s@] means no whitespace or @
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) setEmailError("Email is required");
        else if (!regex.test(email)) setEmailError("Email must be correct");
        else setEmailError("");
    }


    function validatePassword() {
        if (!password) setPasswordError("Password is required");
        else setPasswordError("");
    }


    async function onSubmit(event) {
        event.preventDefault();
        setServerError("");
        validateEmail();
        validatePassword();

        if (emailError.length > 0 || passwordError.length > 0) return;

        const formData = new FormData();
        formData.append("username", email);
        formData.append("password", password);

        try {
            const response = await fetch("http://localhost:8000/v1/auth/login", {
                method: "POST",
                body: formData
            });

            if (response.status === 200) {
                const data = await response.json();
                setToken(data.access_token);
                setRoot(data.root);
                onLogin(data);
            }
            else if (response.status === 401) {
                setServerError("Wrong username or password");
            }
            else {
                setServerError("Login failed due to unexpected error");
            }
        }
        catch (error) {
            setServerError("Login failed due to unexpected error");
        }
    }


    return <div>
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onBlur={validatePassword}></input>
                {passwordError && <p className="text-red-800 text-xs">{passwordError}</p>}
            </div>
            <div className="flex flex-col p-3">
                <button
                    onClick={onSubmit}
                    className="cursor-pointer bg-gray-200 border border-gray-300 px-2 py-1"
                    type="submit">Login</button>
                {serverError && <p className="text-red-800 text-xs">{serverError}</p>}
            </div>
        </form>
    </div>
}