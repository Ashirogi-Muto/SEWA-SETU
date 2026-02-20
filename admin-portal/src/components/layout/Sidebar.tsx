// src/components/layout/Sidebar.tsx
import { NavLink, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  FileText, 
  Home, 
  Users, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Departments", href: "/departments", icon: Users },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const location = useLocation();

  return (
    <aside 
      className={cn(
        "hidden md:flex h-screen flex-col transition-all duration-300 border-r bg-card",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-2 overflow-hidden">
            <img src="/favicon-32x32.png" alt="SEWASETU Logo" className="h-8 w-8 flex-shrink-0" />
            <div>
              <h1 className="text-lg font-semibold text-foreground truncate">SEWASETU</h1>
              <p className="text-xs text-muted-foreground">Admin Portal</p>
            </div>
          </div>
        )}
        {collapsed && (
          <img src="/favicon-32x32.png" alt="SEWASETU Logo" className="h-8 w-8" />
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 flex-shrink-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center"
              )}
            >
              <item.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-2 border-t mt-auto">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-accent-foreground",
            collapsed && "justify-center"
          )}
        >
          <LogOut className={cn("h-5 w-5", !collapsed && "mr-3")} />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
}