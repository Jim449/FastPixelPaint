import { create } from "zustand"

const loadInitialState = () => {
    const token = localStorage.getItem("token") || null;
    const userData = JSON.parse(localStorage.getItem("userData")) || null;

    return { token: token, userData };
};

export const authStore = create((set, get) => ({
    ...loadInitialState(),
    setToken: (token) => {
        localStorage.setItem("token", token);
        set(() => ({ token: token }));
    },
    logout: (set) => {
        localStorage.removeItem("token");
        set(() => ({ token: null }));
    },
    setUserData: (userData) => {
        localStorage.setItem("userData", JSON.stringify(userData));
        set(() => ({ userData }));
    },
    fetchUser: async () => {
        const { token, logout, setUserData } = get();
        try {
            const response = await fetch("http://localhost:8000/general/user", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            if (response.status === 200) {
                const userData = await response.json();
                setUserData(userData);
            }
            else if (response.status === 401) {
                logout();
            }
        }
        catch { }
    }
}));