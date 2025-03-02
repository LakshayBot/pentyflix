import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const authApi = {
    login: async (username: string, password: string) => {
        const response = await api.post("/Auth/login", { username, password });
        return response.data;
    },
    register: async (userData: {
        username: string;
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
    }) => {
        const response = await api.post("/Auth/register", userData);
        return response.data;
    },
};
