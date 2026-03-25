import { useState, useEffect, useCallback } from "react";

interface AuthUser {
  username: string;
  role: "student" | "lecturer";
  token: string;
}

const USERS = [
  { username: "student", password: "student123", role: "student" as const },
  { username: "lecturer", password: "ITT2025", role: "lecturer" as const },
];

function generateToken(username: string, role: string): string {
  const payload = { username, role, exp: Date.now() + 60 * 60 * 1000 };
  return btoa(JSON.stringify(payload));
}

function decodeToken(token: string): { username: string; role: string; exp: number } | null {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("zcu_token");
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.exp > Date.now()) {
        setUser({ username: decoded.username, role: decoded.role as "student" | "lecturer", token });
      } else {
        localStorage.removeItem("zcu_token");
        localStorage.removeItem("zcu_role");
        localStorage.removeItem("zcu_username");
      }
    }
    setLoading(false);
  }, []);

  // Auto logout on expiry
  useEffect(() => {
    if (!user) return;
    const decoded = decodeToken(user.token);
    if (!decoded) return;
    const timeout = decoded.exp - Date.now();
    if (timeout <= 0) { logout(); return; }
    const timer = setTimeout(logout, timeout);
    return () => clearTimeout(timer);
  }, [user]);

  const login = useCallback((username: string, password: string): { success: boolean; error?: string } => {
    const found = USERS.find((u) => u.username === username && u.password === password);
    if (!found) return { success: false, error: "Invalid username or password" };
    const token = generateToken(found.username, found.role);
    localStorage.setItem("zcu_token", token);
    localStorage.setItem("zcu_role", found.role);
    localStorage.setItem("zcu_username", found.username);
    setUser({ username: found.username, role: found.role, token });
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("zcu_token");
    localStorage.removeItem("zcu_role");
    localStorage.removeItem("zcu_username");
    setUser(null);
  }, []);

  return { user, loading, login, logout };
}
