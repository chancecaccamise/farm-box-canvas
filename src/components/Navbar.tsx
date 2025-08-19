
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import billysLogo from "@/assets/billysBotanicals-Logo-v1.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  User, 
  ShoppingBag, 
  Calendar,
  LogOut,
  Settings,
  Menu,
  X,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

const Navbar = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDisplayName = () => {
    if (profile?.first_name) {
      return `Hello, ${profile.first_name}`;
    }
    if (user?.email) {
      return `Hello, ${user.email.split('@')[0]}`;
    }
    return 'Account';
  };

  return (
    <nav className="bg-background border-b shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={billysLogo} 
              alt="Billy's Botanicals Logo" 
              className="h-16 w-auto object-contain transition-smooth hover:opacity-80"
            />
          </Link>

          {/* Center Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* About Us Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 text-foreground hover:text-primary transition-smooth font-medium">
                <span>About Us</span>
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 backdrop-blur-sm border border-border/50">
                <DropdownMenuItem asChild>
                  <Link to="/how-we-grow" className="transition-smooth">Grown for Good</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/how-farm-bags-work" className="transition-smooth">Billy's Bags To Go 101</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/meet-farmers" className="transition-smooth">Meet the Duggers</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* My Bag - positioned after About Us */}
            {user && (
              <Button variant="ghost" className="text-foreground hover:text-primary transition-smooth font-medium" asChild>
                <Link to="/my-bag" className="flex items-center space-x-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>My Bag</span>
                </Link>
              </Button>
            )}

            <Link to="/faqs" className="text-foreground hover:text-primary transition-smooth font-medium">
              FAQs
            </Link>

            <Link to="/support-local" className="text-foreground hover:text-primary transition-smooth font-medium">
              Support Local
            </Link>

            <Link to="/fresh-catch" className="text-foreground hover:text-primary transition-smooth font-medium">
              Fresh Catch
            </Link>

            <Link to="/anas-flowers" className="text-foreground hover:text-primary transition-smooth font-medium">
              Ana's Arrangements
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 pt-6">
                  {/* User Section */}
                  {user && (
                    <div className="flex items-center space-x-3 pb-4 border-b">
                      <div className="w-10 h-10 bg-gradient-fresh rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{getDisplayName()}</p>
                        <p className="text-sm text-muted-foreground">Subscriber</p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Links */}
                  <div className="space-y-3">
                    <div className="pt-2">
                      <p className="text-sm font-medium text-muted-foreground mb-3">About Us</p>
                      <div className="space-y-1 pl-4">
                        <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                          <Link to="/how-we-grow" onClick={() => setMobileMenuOpen(false)}>
                            Grown for Good
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                          <Link to="/how-farm-bags-work" onClick={() => setMobileMenuOpen(false)}>
                          Billy's Bags To Go 101
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                          <Link to="/meet-farmers" onClick={() => setMobileMenuOpen(false)}>
                            Meet the Duggers
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {user && (
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link to="/my-bag" onClick={() => setMobileMenuOpen(false)}>
                          <ShoppingBag className="w-4 h-4 mr-3" />
                          My Bag
                        </Link>
                      </Button>
                    )}

                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/faqs" onClick={() => setMobileMenuOpen(false)}>
                        FAQs
                      </Link>
                    </Button>

                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/support-local" onClick={() => setMobileMenuOpen(false)}>
                        Support Local
                      </Link>
                    </Button>

                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/fresh-catch" onClick={() => setMobileMenuOpen(false)}>
                        Fresh Catch
                      </Link>
                    </Button>

                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/anas-flowers" onClick={() => setMobileMenuOpen(false)}>
                        Ana's Arrangements
                      </Link>
                    </Button>
                  </div>

                  {/* Auth Section */}
                  <div className="pt-4 border-t space-y-3">
                    {user ? (
                      <>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                          <Link to="/my-plan" onClick={() => setMobileMenuOpen(false)}>
                            <Calendar className="w-4 h-4 mr-3" />
                            My Plan
                          </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                          <Link to="/account" onClick={() => setMobileMenuOpen(false)}>
                            <Settings className="w-4 h-4 mr-3" />
                            Account Settings
                          </Link>
                        </Button>
                        {isAdmin && (
                          <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                              <Shield className="w-4 h-4 mr-3" />
                              Admin Dashboard
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-destructive"
                          onClick={() => {
                            signOut();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" className="w-full" asChild>
                          <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                            Login
                          </Link>
                        </Button>
                        <Button className="w-full" asChild>
                          <Link to="/auth?signup=true" onClick={() => setMobileMenuOpen(false)}>
                            Sign Up
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Right Side - Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Account Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline">{getDisplayName()}</span>
                    <ChevronDown className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-sm border border-border/50">
                    <DropdownMenuItem asChild>
                      <Link to="/my-plan" className="flex items-center space-x-2 transition-smooth">
                        <Calendar className="w-4 h-4" />
                        <span>My Plan</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="flex items-center space-x-2 transition-smooth">
                        <Settings className="w-4 h-4" />
                        <span>Account Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center space-x-2 transition-smooth">
                          <Shield className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      className="flex items-center space-x-2 text-destructive cursor-pointer transition-smooth hover:bg-destructive/10"
                      onClick={() => signOut()}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              /* Login/Signup buttons for unauthenticated users */
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth?signup=true">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
