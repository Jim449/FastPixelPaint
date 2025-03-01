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
        set(() => { { token: token } })
    },
    logout: (set) => {
        localStorage.removeItem("token");
        set(() => ({
            token: null
        }))
    },
    setUserData: (userData) => {
        localStorage.setItem("userData", JSON.stringify(userData)),
            set(() => ({ userData }));
    },
    // fetchUser: async() => {
    //     const {token, logout, setUserData } = get();
    //     try {
    //         // Write the fetch user
    //         const response = await fetch(`${API_URL}/some path`, {
    //             method: "GET",
    //             headers: {
    //                 Authorization: `Bearer ${token}`
    //             }
    //         }
    //     }
    // }
}));