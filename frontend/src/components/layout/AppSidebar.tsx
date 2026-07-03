import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Search, CalendarDays, Users, Gamepad2,
  BarChart3, Settings, LogOut, ChevronLeft, ChevronRight,
  Building2, Clock, BookOpen, AlertTriangle,
} from "lucide-react";
import { useRole } from "@/contexts/RoleContext";

const playerNav = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Discover Turfs", path: "/discover", icon: Search },
  { title: "Book Slots", path: "/booking", icon: CalendarDays },
  { title: "Matchmaking", path: "/matchmaking", icon: Users },
  { title: "My Games", path: "/my-games", icon: Gamepad2 },
];

const providerNav = [
  { title: "Dashboard", path: "/provider", icon: BarChart3 },
  { title: "Manage Turfs", path: "/provider/turfs", icon: Building2 },
  { title: "Slot Management", path: "/provider/slots", icon: Clock },
  { title: "View Bookings", path: "/provider/bookings", icon: BookOpen },
];

interface AppSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ isMobile = false, onClose }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { role, setRole, userName, logout } = useRole();

  const isActive = (path: string) => location.pathname === path;
  const navItems = role === "player" ? playerNav : providerNav;

  const isCollapsed = isMobile ? false : collapsed;

  const handleLinkClick = () => {
    onClose?.();
  };

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate("/login");
  };

  const handleRoleSwitch = () => {
    const newRole = role === "player" ? "provider" : "player";
    setRole(newRole);
    onClose?.();
    navigate(newRole === "player" ? "/dashboard" : "/provider");
  };

  return (
    <aside
      className={
        isMobile
          ? "w-full h-full bg-sidebar flex flex-col relative text-foreground"
          : `${
              collapsed ? "w-[72px]" : "w-[260px]"
            } h-screen sticky top-0 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50`
      }
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border gap-2">
        <img src="/favicon.png" alt="Playmate Logo" className="h-8 w-8 object-contain shrink-0" />
        {!isCollapsed && (
          <span className="text-xl font-bold tracking-tight neon-text">
            PlayMate
          </span>
        )}
      </div>

      {/* Role indicator */}
      {!isCollapsed && (
        <div className="px-3 pt-4 pb-2">
          <div className="glass-card p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
              <p className="text-xs text-primary capitalize">{role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <p className={`px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${isCollapsed ? "hidden" : ""}`}>
          {role === "player" ? "Player" : "Provider"}
        </p>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
              isActive(item.path)
                ? "bg-primary/15 text-primary neon-border"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <item.icon className={`h-5 w-5 shrink-0 ${isActive(item.path) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
            {!isCollapsed && <span>{item.title}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        {/* Role switch */}
        <button
          onClick={handleRoleSwitch}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Switch to {role === "player" ? "Provider" : "Player"}</span>}
        </button>
        <Link
          to="/settings"
          onClick={handleLinkClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      )}
    </aside>
  );
}
