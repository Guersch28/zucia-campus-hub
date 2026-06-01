import { useState, useEffect, useCallback } from "react";
import { authApi } from "@/services/api";

interface AuthUser {
  username: string;
  role: "student" | "lecturer";
  token: string;
}

const TOKEN_KEY = "zcu_token";
const ROLE_KEY = "zcu_role";
const USER_KEY = "zcu_username";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const role = localStorage.getItem(ROLE_KEY) as "student" | "lecturer" | null;
    const username = localStorage.getItem(USER_KEY);
    if (token && role && username) {
      setUser({ token, role, username });
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    async (
      username: string,
      password: string,
    ): Promise<{ success: boolean; error?: string; role?: "student" | "lecturer" }> => {
      try {
        const data = await authApi.login(username, password);
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(ROLE_KEY, data.role);
        localStorage.setItem(USER_KEY, data.username);
        setUser({ token: data.token, role: data.role, username: data.username });
        return { success: true, role: data.role };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Login failed";
        return { success: false, error: msg };
      }
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return { user, loading, login, logout };
}
