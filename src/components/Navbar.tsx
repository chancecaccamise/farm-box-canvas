import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  Gift, 
  User, 
  ShoppingBag, 
  Calendar,
  LogOut,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-background border-b shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-fresh rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🌱</span>
            </div>
            <span className="text-xl font-bold text-primary">FarmBox</span>
          </Link>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/my-plan" className="text-foreground hover:text-primary transition-colors">
              My Plan
            </Link>
            
            <Link to="/my-bag" className="text-foreground hover:text-primary transition-colors flex items-center space-x-1">
              <ShoppingBag className="w-4 h-4" />
              <span>My Bag</span>
            </Link>

            {/* About Us Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors">
                <span>About Us</span>
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link to="/how-we-grow">How We Grow</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/our-mission">Our Mission</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/meet-farmers">Meet the Farmers</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/faqs" className="text-foreground hover:text-primary transition-colors">
              FAQs
            </Link>

            <Link to="/gift-cards" className="text-foreground hover:text-primary transition-colors">
              Gift Cards
            </Link>

            <Link to="/sustainability" className="text-foreground hover:text-primary transition-colors">
              Sustainability
            </Link>

            <Link to="/support-local" className="text-foreground hover:text-primary transition-colors">
              Support Local
            </Link>

            <Link to="/anas-flowers" className="text-foreground hover:text-primary transition-colors">
              Ana's Flowers
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Rewards */}
            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline">Rewards</span>
              <Badge variant="secondary" className="ml-1">12</Badge>
            </Button>

            {/* Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Hello, Ana</span>
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/my-plan" className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>My Plan</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/my-bag" className="flex items-center space-x-2">
                    <ShoppingBag className="w-4 h-4" />
                    <span>My Bag</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account-settings" className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center space-x-2 text-destructive">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;