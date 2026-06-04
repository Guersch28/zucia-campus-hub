import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import Sidebar from "@/components/Sidebar";
import ChatDrawer from "@/components/ChatDrawer";
import { Moon, Sun } from "lucide-react";
import zcuLogo from "@/assets/zcu-logo.png";

interface ProtectedLayoutProps {
  allowedRole?: "student" | "lecturer";
}

const ProtectedLayout = ({ allowedRole }: ProtectedLayoutProps) => {
  const { user, loading } = useAuth();
  const { theme, toggle } = useTheme();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === "student" ? "/student" : "/lecturer"} replace />;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3 ml-10 md:ml-0">
            <div className="w-9 h-9 rounded-lg bg-background p-0.5 flex items-center justify-center border border-border">
              <img src={zcuLogo} alt="ZCU" className="w-full h-full object-contain" />
            </div>
            <span className="text-sm font-semibold text-foreground hidden sm:block">ZCU ChatBot</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-lg border border-border hover:bg-muted text-foreground transition-all"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Welcome, <strong className="text-foreground">{user.username}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-full zcu-gold-gradient text-accent-foreground text-xs font-semibold capitalize">
              {user.role}
            </span>
          </div>
        </header>
        <Outlet />
      </main>
      <ChatDrawer />
    </div>
  );
};

export default ProtectedLayout;
