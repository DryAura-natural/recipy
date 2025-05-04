import { useState, useContext, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { UserContext } from "@/App";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Navbar() {
  const [location] = useLocation();
  const { user, setUser } = useContext(UserContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      const data = await response.json();
      setUser(data);
      setIsLoginOpen(false);
      setUsername("");
      setPassword("");
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.username}!`,
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiRequest("POST", "/api/auth/register", { username, password });
      const data = await response.json();
      setUser(data);
      setIsRegisterOpen(false);
      setUsername("");
      setPassword("");
      toast({
        title: "Registration Successful",
        description: `Welcome, ${data.username}!`,
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Username may already exist or is invalid",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setUser(null);
      // Close mobile menu if open
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  // Close mobile menu when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Utensils className="text-primary text-xl" />
            <Link href="/">
              <span className="font-bold text-xl cursor-pointer">Culinary Compass</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <span className={`text-gray-700 hover:text-primary transition-colors cursor-pointer ${location === "/" ? "text-primary font-medium" : ""}`}>
                Home
              </span>
            </Link>
            <Link href="/create">
              <span className={`text-gray-700 hover:text-primary transition-colors cursor-pointer ${location === "/create" ? "text-primary font-medium" : ""}`}>
                Create Recipe
              </span>
            </Link>
            <Link href="/favorites">
              <span className={`text-gray-700 hover:text-primary transition-colors cursor-pointer ${location === "/favorites" ? "text-primary font-medium" : ""}`}>
                Favorites
              </span>
            </Link>
          </div>
          
          {/* User Actions - always visible */}
          <div className="flex items-center">
            {/* Favorites Button */}
            {!isMobile && (
              <Link href="/favorites">
                <Button variant="ghost" size="icon" className="mr-2 text-gray-700 hover:text-primary p-2 rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </Button>
              </Link>
            )}
            
            {/* User Profile or Auth Buttons */}
            {user ? (
              <div className={`flex items-center ${isMobile ? 'mr-2' : 'space-x-3'}`}>
                <div className={`flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-full ${isMobile ? 'hidden md:flex' : ''}`}>
                  <div className="h-7 w-7 bg-primary text-white rounded-full flex items-center justify-center font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">Welcome, {user.username}!</span>
                </div>
                {/* Show smaller version on mobile */}
                {isMobile && (
                  <div className="h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center font-medium md:hidden">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <Button 
                  variant={isMobile ? "ghost" : "outline"} 
                  size="sm" 
                  onClick={handleLogout} 
                  className={`text-gray-700 ${isMobile ? 'hidden md:flex' : ''}`}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {/* Login Dialog */}
                <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className={isMobile ? 'text-sm px-2 py-1' : ''}>Login</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Login to your account</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleLogin} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username" 
                          value={username} 
                          onChange={(e) => setUsername(e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          required 
                        />
                      </div>
                      <Button type="submit" className="w-full">Login</Button>
                    </form>
                    <div className="text-center mt-4">
                      <p className="text-sm text-gray-500">
                        Don't have an account?{" "}
                        <Button 
                          variant="link" 
                          className="p-0" 
                          onClick={() => {
                            setIsLoginOpen(false);
                            setIsRegisterOpen(true);
                          }}
                        >
                          Register
                        </Button>
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {/* Register Dialog */}
                <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                  <DialogTrigger asChild>
                    <Button size={isMobile ? "sm" : "default"} className={isMobile ? 'text-sm px-3 py-1' : ''}>Register</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create an account</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleRegister} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-username">Username</Label>
                        <Input 
                          id="reg-username" 
                          value={username} 
                          onChange={(e) => setUsername(e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Password</Label>
                        <Input 
                          id="reg-password" 
                          type="password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          required 
                        />
                      </div>
                      <Button type="submit" className="w-full">Register</Button>
                    </form>
                    <div className="text-center mt-4">
                      <p className="text-sm text-gray-500">
                        Already have an account?{" "}
                        <Button 
                          variant="link" 
                          className="p-0" 
                          onClick={() => {
                            setIsRegisterOpen(false);
                            setIsLoginOpen(true);
                          }}
                        >
                          Login
                        </Button>
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
            
            {/* Mobile Menu Toggle */}
            <button 
              className="text-gray-700 hover:text-primary p-2 rounded-full transition-colors ml-1 md:hidden"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown - Improved */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-md animation-slideDown">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/">
                <span 
                  className={`flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors cursor-pointer ${location === "/" ? "bg-gray-100 text-primary font-medium" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Home
                </span>
              </Link>
              <Link href="/create">
                <span
                  className={`flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors cursor-pointer ${location === "/create" ? "bg-gray-100 text-primary font-medium" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Create Recipe
                </span>
              </Link>
              <Link href="/favorites">
                <span 
                  className={`flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors cursor-pointer ${location === "/favorites" ? "bg-gray-100 text-primary font-medium" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                  Favorites
                </span>
              </Link>
              
              {/* Additional mobile-only actions */}
              {user && (
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center py-2 px-3">
                    <div className="h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center font-medium mr-3">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{user.username}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2 justify-center" 
                    onClick={handleLogout}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
