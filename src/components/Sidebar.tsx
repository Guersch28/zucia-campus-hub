import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Home, BookOpen, MessageCircle, Database, LogOut, Menu, X, GraduationCap, UserCog,
} from "lucide-react";
import { useState } from "react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isStudent = user?.role === "student";

  const links = isStudent
    ? [
        { to: "/student", label: "Materials", icon: BookOpen },
        { to: "/chatbot", label: "ZUCIA Chat", icon: MessageCircle },
      ]
    : [
        { to: "/lecturer", label: "Dashboard", icon: Home },
        { to: "/chatbot", label: "ZUCIA Chat", icon: MessageCircle },
      ];

  const nav = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-sm font-serif font-bold text-sidebar-primary-foreground">ZCU</span>
          </div>
          <div>
            <h2 className="font-serif font-bold text-sidebar-foreground text-sm">ZUCIA</h2>
            <p className="text-[10px] text-sidebar-foreground/60 italic">Veritas et Lux</p>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-5 py-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent">
          {isStudent ? <GraduationCap className="w-4 h-4 text-sidebar-primary" /> : <UserCog className="w-4 h-4 text-sidebar-primary" />}
          <div>
            <p className="text-xs font-medium text-sidebar-accent-foreground">{user?.username}</p>
            <p className="text-[10px] text-sidebar-foreground/60 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-3 border-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => { logout(); setMobileOpen(false); }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-card border border-border shadow-sm"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-sidebar z-10">
            <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 p-1 text-sidebar-foreground/70 hover:text-sidebar-foreground">
              <X className="w-5 h-5" />
            </button>
            {nav}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block w-64 bg-sidebar h-screen sticky top-0 border-r border-sidebar-border shrink-0">
        {nav}
      </div>
    </>
  );
};

export default Sidebar;
