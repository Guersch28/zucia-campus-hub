import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Home, BookOpen, MessageCircle, LogOut, Menu, X, GraduationCap, UserCog, History,
} from "lucide-react";
import { useState } from "react";
import zcuLogo from "@/assets/zcu-logo.png";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isStudent = user?.role === "student";

  const links = isStudent
    ? [
        { to: "/student", label: "Materials", icon: BookOpen },
        { to: "/chatbot", label: "ZCU ChatBot", icon: MessageCircle },
        { to: "/history", label: "History", icon: History },
      ]
    : [
        { to: "/lecturer", label: "Dashboard", icon: Home },
        { to: "/chatbot", label: "ZCU ChatBot", icon: MessageCircle },
        { to: "/history", label: "History", icon: History },
      ];

  const handleSignOut = () => {
    logout();
    setMobileOpen(false);
    navigate("/login", { replace: true });
  };

  const nav = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sidebar-primary-foreground/95 p-1 flex items-center justify-center shadow-lg shadow-sidebar-primary/30">
            <img src={zcuLogo} alt="ZCU logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="font-bold text-sidebar-foreground text-sm tracking-tight">ZCU ChatBot</h2>
            <p className="text-[10px] text-sidebar-foreground/55 italic">Veritas Vos Liberabit</p>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-accent/60 border border-sidebar-border">
          {isStudent
            ? <GraduationCap className="w-5 h-5 text-sidebar-primary" />
            : <UserCog className="w-5 h-5 text-sidebar-primary" />
          }
          <div>
            <p className="text-sm font-semibold text-sidebar-accent-foreground capitalize">{user?.username}</p>
            <p className="text-[10px] text-sidebar-foreground/55 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-1 mt-2">
        {links.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/25"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
              }`}
            >
              <link.icon className="w-[18px] h-[18px]" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/15 hover:text-destructive transition-all duration-200"
        >
          <LogOut className="w-[18px] h-[18px]" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2.5 rounded-xl bg-card border border-border shadow-lg"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-md" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 bg-sidebar z-10 shadow-2xl">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 transition-all">
              <X className="w-5 h-5" />
            </button>
            {nav}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block w-[260px] bg-sidebar h-screen sticky top-0 border-r border-sidebar-border shrink-0">
        {nav}
      </div>
    </>
  );
};

export default Sidebar;
