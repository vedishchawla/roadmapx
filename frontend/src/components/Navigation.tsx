import { Link, useLocation } from "react-router-dom";
import { Home, Map, BarChart3, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
    }
  };
  
  return (
    <nav className="bg-card border-b border-border shadow-soft">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Map className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              RoadmapX
            </span>
          </Link>
          
          <div className="flex items-center space-x-1">
            <Link to="/dashboard">
              <Button 
                variant={isActive("/dashboard") ? "default" : "ghost"}
                className="transition-smooth"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            
            <Link to="/roadmap">
              <Button 
                variant={isActive("/roadmap") ? "default" : "ghost"}
                className="transition-smooth"
              >
                <Map className="w-4 h-4 mr-2" />
                Roadmap
              </Button>
            </Link>
            
            <Link to="/progress">
              <Button 
                variant={isActive("/progress") ? "default" : "ghost"}
                className="transition-smooth"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Progress
              </Button>
            </Link>
            
            <div className="flex items-center space-x-2 ml-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{user?.name || user?.email}</span>
              </div>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="transition-smooth"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
