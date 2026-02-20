import { useState } from "react";
import { motion } from "framer-motion";
import { Home, FileText, User, LogOut, Bell, Search, Menu, Moon, Sun, MapPin } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const ModernNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications] = useState(3);

  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || 'user@sewasetu.in';

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/auth');
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: FileText, label: 'My Reports', path: '/my-reports' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full"
    >
      {/* Glass Navbar */}
      <div className="backdrop-blur-xl bg-white/70 border-b border-white/10 shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">SewaSetu</h1>
                <p className="text-xs text-slate-500 font-medium">Civic Command Center</p>
              </div>
            </div>

            {/* Center Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    onClick={() => navigate(item.path)}
                    className={`relative px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:from-indigo-700 hover:to-purple-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <span className="font-medium">{item.label}</span>
                    {isActive(item.path) && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Button>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              
              {/* Search Button */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative"
              >
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                    {notifications}
                  </Badge>
                )}
              </Button>

              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 rounded-full hover:bg-slate-100 px-2"
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8 border-2 border-white shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-semibold">
                          {userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden lg:block text-left">
                        <p className="text-sm font-semibold text-slate-900">{userName}</p>
                        <p className="text-xs text-slate-500">Citizen</p>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 backdrop-blur-xl bg-white/90 border-white/20 shadow-2xl"
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-slate-900">{userName}</p>
                      <p className="text-xs text-slate-500">{userEmail}</p>
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator className="bg-slate-200" />
                  
                  <DropdownMenuItem 
                    onClick={() => navigate('/profile')}
                    className="cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => navigate('/my-reports')}
                    className="cursor-pointer"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    <span>My Reports</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-slate-200" />
                  
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Accent Line */}
      <div className="h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
    </motion.header>
  );
};

export default ModernNavbar;
