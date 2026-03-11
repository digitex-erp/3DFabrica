import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, Menu, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error("Login error:", error.message);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout error:", error.message);
    navigate("/");
  };

  return (
    <header className="w-full h-[72px] bg-[#4CAF50] text-white px-4 flex items-center justify-between fixed top-0 z-50">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="lg:hidden text-white">
          <Menu className="h-6 w-6" />
        </Button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="3D Fabrica" className="h-8" />
          <div>
            <div className="text-xl font-bold">3D Fabrica</div>
            <div className="text-xs text-white/80">
              Digitizing Fabrics, Reducing Waste
            </div>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex items-center gap-6 ml-8">
          <Link to="/" className="hover:text-gray-300 transition-colors">
            Home
          </Link>
          <Link to="/studio" className="hover:text-gray-300 transition-colors font-semibold">
            Studio
          </Link>
          <a href="#" className="hover:text-gray-300 transition-colors">
            Pricing
          </a>
          <a href="#" className="hover:text-gray-300 transition-colors">
            Dashboard
          </a>
          <a href="#" className="hover:text-gray-300 transition-colors">
            My Orders
          </a>
          <a href="#" className="hover:text-gray-300 transition-colors">
            Support
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                  <AvatarFallback>{user?.user_metadata?.full_name?.[0] || user?.email?.[0]}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-white hover:text-gray-300"
              onClick={handleLogin}
            >
              Login
            </Button>
            <Button
              className="bg-white text-[#1B365D] hover:bg-gray-100"
              onClick={handleLogin}
            >
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
