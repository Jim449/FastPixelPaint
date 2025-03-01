import React from "react"

export default function Registration() {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // let navigate = 

    async function onSubmit(event) {
        // Fix this later
        try {
            const response = await fetch(
                `${API_URL}/auth/user/create`,
                {
                    method: "POST"
                });
        }
        catch {

        }
    }

    return <div>
        <h1>Register an account</h1>
        <form>
            <label htmlFor="email-field">Email</label>
            <input name="email-field" placeholder="Enter your email"></input>
            <label htmlFor="password-field">Password</label>
            <input name="password-field" placeholder="Enter a password"></input>
            <button onClick={onSubmit} type="submit">Register</button>
        </form>
    </div>
}