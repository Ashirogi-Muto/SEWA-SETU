import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Sparkles, Zap, CheckCircle2, Loader2, User, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const envUrl = import.meta.env.VITE_PUBLIC_API_URL;
const API_URL = envUrl && envUrl.startsWith('http') ? envUrl.replace(/\/$/, '') : '';

const Auth = () => {
  const [userRole, setUserRole] = useState<'citizen' | 'admin'>('citizen');
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Citizen fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');

  // Admin fields
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCitizenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = mode === 'signup' ? '/api/auth/register' : '/api/auth/login';
      const payload: any = {
        email: email,
        password: 'instant-auth' // Dummy password - backend ignores it
      };

      if (mode === 'signup') {
        payload.name = fullName;
      }

      console.log(`📤 ${mode} request to:`, `${API_URL}${endpoint}`);

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `${mode} failed`);
      }

      // Save token to localStorage
      if (data.access_token) {
        localStorage.setItem('authToken', data.access_token);
        localStorage.setItem('userEmail', email);
        if (data.user?.name) {
          localStorage.setItem('userName', data.user.name);
        }
      }

      // Show success animation
      setSuccess(true);

      setTimeout(() => {
        toast({
          title: mode === 'signup' ? "Welcome to SewaSetu! 🎉" : "Welcome back! 👋",
          description: data.message || "You're all set to report issues",
        });

        // Redirect to dashboard
        navigate('/home');
      }, 1000);

    } catch (error) {
      setLoading(false);
      console.error(`❌ ${mode} error:`, error);
      toast({
        title: mode === 'signup' ? "Registration Failed" : "Login Failed",
        description: (error as Error).message || "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Hardcoded admin credentials
    if (adminUsername === 'admin' && adminPassword === 'admin123') {
      setTimeout(() => {
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('adminUsername', adminUsername);

        setSuccess(true);

        setTimeout(() => {
          toast({
            title: "Admin Access Granted 🛡️",
            description: "Welcome to the Command Center",
          });
          navigate('/admin');
        }, 1000);
      }, 800);
    } else {
      setLoading(false);
      toast({
        title: "Access Denied",
        description: "Invalid admin credentials",
        variant: "destructive"
      });
    }
  };

  const handleDemoMode = async () => {
    setLoading(true);
    setEmail('demo@sewasetu.in');
    setFullName('Demo User');

    setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors',
          body: JSON.stringify({
            email: 'demo@sewasetu.in',
            password: 'demo'
          })
        });

        const data = await response.json();

        if (data.access_token) {
          localStorage.setItem('authToken', data.access_token);
          localStorage.setItem('userEmail', 'demo@sewasetu.in');
          localStorage.setItem('userName', 'Demo User');
        }

        setSuccess(true);

        setTimeout(() => {
          toast({
            title: "Demo Mode Activated! 🚀",
            description: "Explore SewaSetu with a test account",
          });
          navigate('/home');
        }, 1000);

      } catch (error) {
        setLoading(false);
        toast({
          title: "Demo Mode Failed",
          description: "Please try manual login",
          variant: "destructive"
        });
      }
    }, 500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">

          {/* Logo and title */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <MapPin className="w-12 h-12 text-indigo-600" />
                <Sparkles className="w-5 h-5 text-yellow-500 absolute -top-1 -right-1" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              SewaSetu
            </h1>
            <p className="text-gray-600 mt-2">Unified Login Portal</p>
          </div>

          {/* Glassmorphism card */}
          <div
            className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl border border-white/50 p-8 transition-all duration-500 ease-in-out"
            style={{
              animation: success ? 'scale-up 0.5s ease-out' : 'slide-up 0.6s ease-out',
              transform: success ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            {success ? (
              /* Success state */
              <div className="text-center py-12 animate-fade-in">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                  <CheckCircle2 className="w-12 h-12 text-green-600 animate-scale-in" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
                <p className="text-gray-600">Redirecting to dashboard...</p>
              </div>
            ) : (
              <>
                {/* Role Selector */}
                <div className="flex rounded-xl bg-gray-100/50 p-1 mb-6">
                  <button
                    type="button"
                    onClick={() => setUserRole('citizen')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${userRole === 'citizen'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-800'
                      }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Citizen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Redirect to the external Admin Portal running on port 3005
                      // If the user sets up a domain for the admin portal later, this URL should be updated.
                      window.location.href = 'http://161.118.168.100:3005';
                    }}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {userRole === 'citizen' ? (
                    <motion.div
                      key="citizen"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Citizen Login/Signup Toggle */}
                      <div className="flex rounded-xl bg-indigo-50/50 p-1 mb-6">
                        <button
                          type="button"
                          onClick={() => setMode('login')}
                          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${mode === 'login'
                            ? 'bg-white text-indigo-600 shadow-md'
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                          Sign In
                        </button>
                        <button
                          type="button"
                          onClick={() => setMode('signup')}
                          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${mode === 'signup'
                            ? 'bg-white text-indigo-600 shadow-md'
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                          Join Us
                        </button>
                      </div>

                      <form onSubmit={handleCitizenSubmit} className="space-y-5">
                        {/* Full Name field - only for signup */}
                        <div
                          className="transition-all duration-300 overflow-hidden"
                          style={{
                            maxHeight: mode === 'signup' ? '100px' : '0',
                            opacity: mode === 'signup' ? 1 : 0
                          }}
                        >
                          <Label htmlFor="fullName" className="text-gray-700 font-medium">
                            Full Name
                          </Label>
                          <Input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            className="mt-1 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm"
                            required={mode === 'signup'}
                          />
                        </div>

                        {/* Email field */}
                        <div>
                          <Label htmlFor="email" className="text-gray-700 font-medium">
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="mt-1 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm"
                            required
                          />
                        </div>

                        {/* Submit button */}
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                        >
                          {loading ? (
                            <span className="flex items-center justify-center">
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Processing...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              {mode === 'signup' ? 'Create Account' : 'Sign In'}
                              <Zap className="w-5 h-5 ml-2" />
                            </span>
                          )}
                        </Button>
                      </form>

                      {/* Demo mode button */}
                      <div className="mt-6">
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white/70 text-gray-500">or</span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={handleDemoMode}
                          disabled={loading}
                          variant="outline"
                          className="w-full mt-4 border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 py-6 rounded-xl font-medium transition-all duration-300"
                        >
                          <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
                          Try Demo Mode
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="admin"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mb-6 p-4 rounded-lg bg-slate-50 border-l-4 border-slate-700">
                        <p className="text-sm text-slate-700 font-medium flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Government Official Access
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          Authorized personnel only
                        </p>
                      </div>

                      <form onSubmit={handleAdminSubmit} className="space-y-5">
                        {/* Username field */}
                        <div>
                          <Label htmlFor="adminUsername" className="text-gray-700 font-medium">
                            Username
                          </Label>
                          <Input
                            id="adminUsername"
                            type="text"
                            value={adminUsername}
                            onChange={(e) => setAdminUsername(e.target.value)}
                            placeholder="Enter admin username"
                            className="mt-1 border-slate-200 focus:border-slate-500 focus:ring-slate-500 bg-white/50 backdrop-blur-sm"
                            required
                          />
                        </div>

                        {/* Password field */}
                        <div>
                          <Label htmlFor="adminPassword" className="text-gray-700 font-medium">
                            Password
                          </Label>
                          <Input
                            id="adminPassword"
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="Enter secure password"
                            className="mt-1 border-slate-200 focus:border-slate-500 focus:ring-slate-500 bg-white/50 backdrop-blur-sm"
                            required
                          />
                        </div>

                        {/* Submit button */}
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white py-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                        >
                          {loading ? (
                            <span className="flex items-center justify-center">
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Verifying...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              <Shield className="w-5 h-5 mr-2" />
                              Access Command Center
                            </span>
                          )}
                        </Button>
                      </form>

                      <div className="mt-6 p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <p className="text-xs text-amber-800 text-center">
                          🔐 Demo Credentials: <span className="font-mono font-semibold">admin / admin123</span>
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* Bottom note */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {userRole === 'citizen' ? (
              <>🚀 Instant Auth • No Password Required • AWS Powered</>
            ) : (
              <>🛡️ Secure Admin Portal • Government Access Only</>
            )}
          </p>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-up {
          from {
            transform: scale(0.95);
            opacity: 0.8;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Auth;
