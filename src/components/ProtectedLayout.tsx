import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import ChatDrawer from "@/components/ChatDrawer";

interface ProtectedLayoutProps {
  allowedRole?: "student" | "lecturer";
}

const ProtectedLayout = ({ allowedRole }: ProtectedLayoutProps) => {
  const { user, loading } = useAuth();

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
            <div className="w-8 h-8 rounded-lg zcu-gradient flex items-center justify-center">
              <span className="text-xs font-serif font-bold text-primary-foreground">Z</span>
            </div>
            <span className="text-sm font-semibold text-foreground hidden sm:block">ZUCIA Portal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Welcome, <strong className="text-foreground">{user.username}</strong></span>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">{user.role}</span>
          </div>
        </header>
        <Outlet />
      </main>
      <ChatDrawer />
    </div>
  );
};

export default ProtectedLayout;
