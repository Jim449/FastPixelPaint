import { create } from "zustand"

const loadInitialState = () => {
    const token = localStorage.getItem("token") || null;
    const folderId = localStorage.getItem("folderId") || null;
    const rootId = localStorage.getItem("rootId") || null;
    const userData = JSON.parse(localStorage.getItem("userData")) || null;

    return { token: token, folderId: folderId, rootId: rootId, userData, imageId: null, paletteId: null };
};

export const authStore = create((set, get) => ({
    ...loadInitialState(),
    setToken: (token) => {
        localStorage.setItem("token", token);
        set(() => ({ token: token }));
    },
    setFolder: (folderId) => {
        localStorage.setItem("folderId", folderId);
        set(() => ({ folderId: folderId }));
    },
    setRoot: (rootId) => {
        localStorage.setItem("folderId", rootId);
        localStorage.setItem("rootId", rootId);
        set(() => ({ folderId: rootId, rootId: rootId }));
    },
    setImage: (imageId) => {
        set(() => ({ imageId: imageId }));
    },
    setPalette: (paletteId) => {
        set(() => ({ paletteId: paletteId }));
    },
    logout: async () => {
        try {
            const { token } = get();
            console.log(token);
            const response = await fetch("http://localhost:8000/v1/auth/logout", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
        }
        catch (error) {
            console.log(error);
        }
        localStorage.removeItem("token");
        set(() => ({ token: null }));
    },
    setUserData: (userData) => {
        localStorage.setItem("userData", JSON.stringify(userData));
        set(() => ({ userData }));
    },
    fetchUser: async () => {
        const { token, logout, setUserData } = get();
        if (!token) return;

        try {
            const response = await fetch("http://localhost:8000/v1/user", {
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
        catch (error) {
            console.log(error);
        }
    }
}));