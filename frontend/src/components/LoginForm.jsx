import React from "react";
import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { authStore } from "src/store/authStore";

export default function LoginForm() {

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    // const { setToken } = authStore();


    // async function onSubmit(event) {
    //     event.preventDefault();
    // Do some validation

    // formData.append("username", email);
    // formData.append("password", password);

    // try {
    //     const response = await fetch(`${API_URL}/auth/token`, {
    //         method: "POST",
    //         // body: formData
    //     });
    // }
    // catch {
    // Handle login error
    //     }
    // }

    return <div><h1>Login</h1>
        <form>
            <label htmlFor="email-field">Email</label>
            <input name="email-field" placeholder="Enter your email"></input>
            <label htmlFor="password-field">Password</label>
            <input name="password-field" placeholder="Enter your password"></input>
        </form>
    </div>
}