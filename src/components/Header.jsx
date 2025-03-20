import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  IconUserCircle,
  IconChevronDown,
  IconMenu2,
  IconX,
  IconHome,
  IconList,
  IconCirclePlus,
  IconLogout,
  IconSettings,
  IconUser
} from '@tabler/icons-react';
import { tablerIconProps } from '../utils/iconUtils';
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('You have been signed out');
    navigate('/login');
  };

  // Get user email (prefer email attribute, fallback to username)
  const userEmail = user?.email || user?.username || 'User';
  const userInitial = userEmail.charAt(0).toUpperCase();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: IconHome },
    { name: 'Expenses', path: '/expenses', icon: IconList },
    { name: 'Add Expense', path: '/add-expense', icon: IconCirclePlus },
  ];

  // Updated navigation example with tablerIconProps
  const renderNav = () => (
    <nav className="hidden md:flex gap-1 flex-1 justify-center">
      {isAuthenticated ? (
        <>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button 
                key={item.path}
                variant={isActive(item.path) ? "secondary" : "ghost"}
                asChild
                className="gap-2"
              >
                <Link to={item.path}>
                  <Icon {...tablerIconProps('sm')} />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button variant="default" asChild>
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>
      )}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border))]/40 bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
              <IconLogo className="size-5 text-primary" />
            </div>
            <span className="hidden font-bold sm:inline-block text-xl">
              Personal Expense Tracker
              <Badge variant="outline" className="ml-2 text-xs bg-primary/10 border-primary/20 text-primary">Beta</Badge>
            </span>
            <span className="inline-block sm:hidden font-bold text-xl">PET</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        {renderNav()}

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 h-9 rounded-full md:px-3">
                  <div className="relative flex size-8 shrink-0 overflow-hidden rounded-full md:size-6">
                    <IconUser {...tablerIconProps('sm')} className="m-auto text-primary" />
                  </div>
                  <span className="hidden md:inline font-medium">
                    {userEmail.split('@')[0]}
                  </span>
                  <IconChevronDown {...tablerIconProps('xs')} className="hidden md:inline opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">My Account</p>
                    <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {navItems.map((item) => (
                    <DropdownMenuItem 
                      key={item.path}
                      onSelect={() => navigate(item.path)} 
                      className="cursor-pointer gap-2"
                    >
                      <item.icon className="size-4" />
                      {item.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem 
                    onSelect={() => navigate('/profile')}
                    className="cursor-pointer gap-2"
                  >
                    <IconSettings {...tablerIconProps('sm')} />
                    Profile & Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onSelect={handleSignOut}
                  className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                >
                  <IconLogout className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Mobile menu button */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <IconMenu2 {...tablerIconProps('md')} />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] pr-0">
              <SheetHeader className="px-6">
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              
              {isAuthenticated ? (
                <div className="flex flex-col gap-2 px-6 py-4">
                  {/* User info */}
                  <div className="flex items-center gap-3 mb-2 pb-4 border-b border-border/50">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <IconUser {...tablerIconProps('md')} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{userEmail.split('@')[0]}</span>
                      <span className="text-xs text-muted-foreground">{userEmail}</span>
                    </div>
                  </div>
                  
                  {/* Mobile Navigation Items */}
                  <div className="flex flex-col gap-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button 
                          key={item.path}
                          variant={isActive(item.path) ? "secondary" : "ghost"}
                          asChild
                          className="justify-start gap-2"
                          onClick={() => setSheetOpen(false)}
                        >
                          <Link to={item.path}>
                            <Icon {...tablerIconProps('sm')} />
                            {item.name}
                          </Link>
                        </Button>
                      );
                    })}
                  </div>
                  
                  {/* Settings */}
                  <div className="flex flex-col gap-1 mt-2 pt-4 border-t border-border/50">
                    <Button 
                      variant="ghost"
                      asChild
                      className="justify-start gap-2"
                      onClick={() => setSheetOpen(false)}
                    >
                      <Link to="/profile">
                        <IconSettings {...tablerIconProps('sm')} />
                        Profile & Settings
                      </Link>
                    </Button>
                    
                    <Button 
                      variant="ghost"
                      className="justify-start gap-2 text-destructive"
                      onClick={() => {
                        handleSignOut();
                        setSheetOpen(false);
                      }}
                    >
                      <IconLogout className="size-4" />
                      Sign out
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-6 py-4">
                  <Button variant="default" asChild onClick={() => setSheetOpen(false)}>
                    <Link to="/login">Log in</Link>
                  </Button>
                  <Button variant="outline" asChild onClick={() => setSheetOpen(false)}>
                    <Link to="/signup">Sign up</Link>
                  </Button>
                </div>
              )}
              
              <div className="absolute right-4 top-4">
                <Button variant="ghost" size="icon" onClick={() => setSheetOpen(false)} aria-label="Close">
                  <IconX className="size-5" />
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

// Icon used in the component
const IconLogo = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export default Header; 