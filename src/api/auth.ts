import api from "./api";

export async function login(email: string, password: string) {
    const res = await api.post("/login", { email, password });
    const { token, user } = res.data;
    localStorage.setItem("token", token);
    return user;
}

export async function logout() {
    await api.post("/logout");
    localStorage.removeItem("token");
}

export async function getUser() {
    const res = await api.get("/currentUser");
    return res.data.data;
}
