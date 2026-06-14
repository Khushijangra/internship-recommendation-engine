import image_571cfe2b2c2ce6af0ecec4962c89220e529c5495 from 'figma:asset/571cfe2b2c2ce6af0ecec4962c89220e529c5495.png';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Search, ChevronDown, Menu, X, Plus, Minus, Bell, User, Settings, FileText, BookOpen, HelpCircle, Shield, Home, LogOut } from 'lucide-react';
import mcaLogo from 'figma:asset/b8a8d6fcc9b8d6136dbc549c42e765cb55ffcff4.png';
import nationalEmblemColorful from 'figma:asset/076c1fce40e331fa68b90d505a199e1f328ef0d4.png';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from './ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
// Removed LanguageToggle - using Google Translate as primary translation option

interface NavbarProps {
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
  }>;
  onProfileClick?: () => void;
  onSubmittedApplicationsClick?: () => void;
  onHomeClick?: () => void;
  onEligibilityClick?: () => void;
  onGuidelinesClick?: () => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onLogoutClick?: () => void;
  currentUser?: {
    name: string;
    email: string;
  } | null;
  submittedApplicationsCount?: number;
}

export function Navbar({ 
  notifications = [], 
  onProfileClick, 
  onSubmittedApplicationsClick,
  onHomeClick,
  onEligibilityClick,
  onGuidelinesClick,
  onLoginClick,
  onRegisterClick,
  onLogoutClick,
  currentUser,
  submittedApplicationsCount = 0
}: NavbarProps) {
  const [fontSize, setFontSize] = useState(16);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const increaseFontSize = () => {
    if (fontSize < 20) {
      const newSize = fontSize + 2;
      setFontSize(newSize);
      document.documentElement.style.setProperty('--font-size', `${newSize}px`);
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 12) {
      const newSize = fontSize - 2;
      setFontSize(newSize);
      document.documentElement.style.setProperty('--font-size', `${newSize}px`);
    }
  };



  return (
    <div className="w-full">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-gov-orange via-gov-white to-gov-green text-white px-2 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Ministry of Corporate Affairs Logo */}
            <img 
              src={mcaLogo} 
              alt="Ministry of Corporate Affairs" 
              className="h-8 w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-800">Smart India Hackathon 2025</span>
              <span className="text-xs text-gray-600">Government of India</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            {/* Font Size Controls */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600">A</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={decreaseFontSize}
                className="h-6 w-6 p-0 text-gray-600 hover:bg-gray-100"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={increaseFontSize}
                className="h-6 w-6 p-0 text-gray-600 hover:bg-gray-100"
              >
                <Plus className="w-3 h-3" />
              </Button>
              <span className="text-sm text-gray-600">A</span>
            </div>


          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <button onClick={onHomeClick} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                {/* National Emblem */}
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1 shadow-sm">
                  <img 
                    src={image_571cfe2b2c2ce6af0ecec4962c89220e529c5495} 
                    alt="National Emblem of India" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-lg font-bold bg-gradient-to-r from-gov-orange to-gov-blue bg-clip-text text-transparent">
                    Intern Setu Portal
                  </span>
                  <span className="text-xs text-gray-600">SIH 2025 • Government of India</span>
                </div>
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Button
                variant="ghost"
                onClick={onHomeClick}
                className="text-gray-700 hover:text-gov-blue transition-colors flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
              
              <Button
                variant="ghost"
                onClick={onEligibilityClick}
                className="text-gray-700 hover:text-gov-blue transition-colors flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Eligibility
              </Button>
              
              <Button
                variant="ghost"
                onClick={onGuidelinesClick}
                className="text-gray-700 hover:text-gov-blue transition-colors flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Guidelines
              </Button>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <Badge 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="border-b p-3">
                    <h4 className="font-medium">Notifications</h4>
                    {unreadCount > 0 && (
                      <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-3 border-b hover:bg-muted/50 ${!notification.read ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex items-start gap-2">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{notification.title}</p>
                              <p className="text-sm text-muted-foreground">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* User Profile or Auth Buttons */}
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
                      <User className="w-4 h-4" />
                      <span className="max-w-32 truncate">{currentUser.name}</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onProfileClick}>
                      <User className="w-4 h-4 mr-2" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onSubmittedApplicationsClick}>
                      <FileText className="w-4 h-4 mr-2" />
                      My Applications
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="w-4 h-4 mr-2" />
                      Notifications
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hidden sm:flex border-gov-blue text-gov-blue hover:bg-gov-blue hover:text-white"
                    onClick={onLoginClick}
                  >
                    Login
                  </Button>
                  
                  <Button 
                    size="sm" 
                    className="hidden sm:flex bg-gradient-to-r from-gov-orange to-gov-blue text-white hover:opacity-90"
                    onClick={onRegisterClick}
                  >
                    Youth Registration
                  </Button>
                </>
              )}

              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t bg-white py-4">
              <nav className="space-y-4">
                <button 
                  onClick={onHomeClick}
                  className="flex items-center gap-2 text-gray-700 hover:text-gov-blue transition-colors w-full text-left"
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
                <button 
                  onClick={onEligibilityClick}
                  className="flex items-center gap-2 text-gray-700 hover:text-gov-blue transition-colors w-full text-left"
                >
                  <Shield className="w-4 h-4" />
                  Eligibility
                </button>
                <button 
                  onClick={onGuidelinesClick}
                  className="flex items-center gap-2 text-gray-700 hover:text-gov-blue transition-colors w-full text-left"
                >
                  <BookOpen className="w-4 h-4" />
                  Guidelines
                </button>
                
                {/* User Profile and Applications for Mobile */}
                {currentUser && (
                  <div className="pt-4 border-t space-y-4">
                    <button 
                      onClick={onProfileClick}
                      className="flex items-center gap-2 text-gray-700 hover:text-gov-blue transition-colors w-full text-left"
                    >
                      <User className="w-4 h-4" />
                      Profile Settings
                    </button>
                    <button 
                      onClick={onSubmittedApplicationsClick}
                      className="flex items-center gap-2 text-gray-700 hover:text-gov-blue transition-colors w-full text-left"
                    >
                      <FileText className="w-4 h-4" />
                      My Applications
                      {submittedApplicationsCount > 0 && (
                        <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0.5">
                          {submittedApplicationsCount}
                        </Badge>
                      )}
                    </button>
                  </div>
                )}
                
                {/* Login/Signup for Mobile when not logged in */}
                {!currentUser ? (
                  <div className="pt-4 border-t space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-gov-blue text-gov-blue hover:bg-gov-blue hover:text-white"
                      onClick={onLoginClick}
                    >
                      Login
                    </Button>
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-gov-orange to-gov-blue text-white hover:opacity-90"
                      onClick={onRegisterClick}
                    >
                      Youth Registration
                    </Button>
                  </div>
                ) : (
                  <div className="pt-4 border-t space-y-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2">
                          <User className="w-4 h-4" />
                          {currentUser.name}
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={onProfileClick}>
                          <User className="w-4 h-4 mr-2" />
                          Profile Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onSubmittedApplicationsClick}>
                          <FileText className="w-4 h-4 mr-2" />
                          My Applications
                          {submittedApplicationsCount > 0 && (
                            <Badge variant="secondary" className="ml-auto">
                              {submittedApplicationsCount}
                            </Badge>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            console.log('Sign out clicked in Navbar');
                            if (onLogoutClick) {
                              onLogoutClick();
                            } else {
                              console.error('onLogoutClick is not defined');
                            }
                          }} 
                          className="text-red-600"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}