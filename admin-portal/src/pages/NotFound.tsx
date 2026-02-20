import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <img src="/favicon-32x32.png" alt="SEWASETU Logo" className="h-16 w-16" />
          </div>
          <CardTitle className="text-4xl font-bold mb-2">404</CardTitle>
          <CardTitle className="text-xl">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-sm text-muted-foreground">
            Requested path: <code className="bg-muted px-2 py-1 rounded">{location.pathname}</code>
          </p>
          <div className="space-y-2">
            <Link to="/">
              <Button className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Return to Dashboard
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" className="w-full">
                Go to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
