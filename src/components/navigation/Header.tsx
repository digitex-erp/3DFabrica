import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, Menu, User } from "lucide-react";

interface HeaderProps {
  isLoggedIn?: boolean;
  userAvatar?: string;
  userName?: string;
  onLogin?: () => void;
  onLogout?: () => void;
  onSignup?: () => void;
}

const Header = () => {
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();

  return (
    <header className="w-full h-[72px] bg-[#4CAF50] text-white px-4 flex items-center justify-between fixed top-0 z-50">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="lg:hidden text-white">
          <Menu className="h-6 w-6" />
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="3D Fabrica" className="h-8" />
          <div>
            <div className="text-xl font-bold">3D Fabrica</div>
            <div className="text-xs text-white/80">
              Digitizing Fabrics, Reducing Waste
            </div>
          </div>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex items-center gap-6 ml-8">
          <a href="#" className="hover:text-gray-300 transition-colors">
            Home
          </a>
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
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.picture} alt={user?.name} />
                  <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
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
                onClick={() =>
                  logout({ logoutParams: { returnTo: window.location.origin } })
                }
              >
                <LogIn className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-white hover:text-gray-300"
              onClick={() => loginWithRedirect()}
            >
              Login
            </Button>
            <Button
              className="bg-white text-[#1B365D] hover:bg-gray-100"
              onClick={() =>
                loginWithRedirect({
                  authorizationParams: { screen_hint: "signup" },
                })
              }
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
