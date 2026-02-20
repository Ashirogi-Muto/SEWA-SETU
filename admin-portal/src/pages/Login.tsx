// src/pages/Login.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertCircle, Users } from "lucide-react";
import { toast } from "sonner";

// TODO: Switch to live API by changing the import to '@/lib/api' and the function to 'apiFetch'
import { login } from "@/lib/api";

interface AuthResponse {
  access_token: string;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Clear any existing authentication data when login page loads
  useEffect(() => {
    localStorage.removeItem("auth_token");
    localStorage.clear(); // Clear all cached data
  }, []);

  const mutation = useMutation<AuthResponse, Error, { email: string; password: string }>({
    // TODO: When switching to live API, this becomes:
    // mutationFn: (credentials) => apiFetch('/auth/login', { ... }),
    mutationFn: login,
    onSuccess: (data) => {
      toast.success("Login successful", {
        description: "Welcome to SEWASETU Admin Portal",
      });
      localStorage.setItem("auth_token", data.access_token);
      navigate("/");
    },
    onError: (error) => {
       toast.error("Login Failed", {
        description: error.message,
      });
    }
  });

  const handleSwitchToCitizenPortal = () => {
    // Navigate to citizen portal live demo
    window.location.href = 'https://citizen-portal-git-main-idkanythinghelps-projects.vercel.app';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img src="/favicon-32x32.png" alt="SEWASETU Logo" className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">SEWASETU</h1>
          <p className="text-lg text-muted-foreground">Admin Portal</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Administrator Login</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Portal Switcher */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Are you a citizen looking to report issues?
              </p>
              <Button 
                variant="outline" 
                onClick={handleSwitchToCitizenPortal}
                className="w-full flex items-center justify-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Switch to Citizen Portal</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        
         <Card className="bg-accent/20 border-accent">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-kpi-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Demo Credentials</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Email: admin@sewasetu.gov<br />
                  Password: admin123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}