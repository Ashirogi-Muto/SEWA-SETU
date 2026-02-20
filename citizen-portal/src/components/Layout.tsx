import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Home, FileText, User, LogOut, MapPin } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

const Layout = ({ children, showHeader = true }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname.includes('/login') || 
                     location.pathname.includes('/signup') || 
                     location.pathname.includes('/auth') ||
                     location.pathname === '/';
  
  const token = localStorage.getItem('authToken');
  const userName = localStorage.getItem('userName') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    navigate('/auth');
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: FileText, label: 'My Reports', path: '/my-reports' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Floating Pill Navigation - Only show if authenticated and showHeader is true */}
      {showHeader && token && !isAuthPage && (
        <nav 
          className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down"
          style={{
            animation: 'slideDown 0.5s ease-out'
          }}
        >
          <div className="backdrop-blur-xl bg-white/80 border border-white/50 rounded-full shadow-2xl px-6 py-3 flex items-center space-x-2">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-2 pr-4 border-r border-gray-300">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-800 hidden sm:inline">SewaSetu</span>
            </div>

            {/* Navigation Items */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  onClick={() => navigate(item.path)}
                  className={`rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                  size="sm"
                >
                  <Icon className="h-4 w-4 mr-0 sm:mr-2" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              );
            })}

            {/* User Section */}
            <div className="flex items-center space-x-2 pl-4 border-l border-gray-300">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-xs font-medium text-gray-700">{userName}</span>
                <span className="text-xs text-gray-500">Online</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="rounded-full text-gray-600 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className={showHeader && token && !isAuthPage ? 'pt-24' : ''}>
        {children}
      </main>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
