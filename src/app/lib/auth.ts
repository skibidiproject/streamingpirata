// lib/auth.ts - Hook per React
import { useEffect, useState } from "react";

export interface User {
    id: string;
    username: string;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);

    const login = async (username: string, password: string) => {
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: "Errore di connessione" };
        }
    };

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            setUser(null);
        } catch (error) {
            console.error("Errore logout:", error);
        }
    };

    return {
        user,
        login,
        logout,
        isAuthenticated: !!user,
    };
}