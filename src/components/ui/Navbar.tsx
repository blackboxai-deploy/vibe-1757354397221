'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { formatUserName, getUserAvatarUrl } from '@/lib/auth';

interface NavbarProps {
  title?: string;
  showUserMenu?: boolean;
}

export function Navbar({ title, showUserMenu = true }: NavbarProps) {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold text-gray-900">RideShare</span>
            </Link>
            {title && (
              <>
                <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
                <h1 className="hidden sm:block text-lg font-semibold text-gray-700">{title}</h1>
              </>
            )}
          </div>

          {/* User Menu */}
          {showUserMenu && isAuthenticated && user ? (
            <div className="flex items-center space-x-4">
              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-6">
                {user.userType === 'rider' ? (
                  <>
                    <Link
                      href="/rider/dashboard"
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/rider/history"
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                    >
                      History
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/driver/dashboard"
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/driver/earnings"
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                    >
                      Earnings
                    </Link>
                  </>
                )}
              </div>

              {/* User Menu Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getUserAvatarUrl(user)} alt={formatUserName(user)} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        {getUserInitials(formatUserName(user))}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{formatUserName(user)}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {user.userType} Account
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Mobile navigation links */}
                  <div className="md:hidden">
                    {user.userType === 'rider' ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/rider/dashboard" className="w-full cursor-pointer">
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/rider/history" className="w-full cursor-pointer">
                            Ride History
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/rider/payment" className="w-full cursor-pointer">
                            Payment Methods
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/driver/dashboard" className="w-full cursor-pointer">
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/driver/earnings" className="w-full cursor-pointer">
                            Earnings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/driver/vehicle" className="w-full cursor-pointer">
                            Vehicle Info
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                  </div>

                  <DropdownMenuItem asChild>
                    <Link href="/auth/profile" className="w-full cursor-pointer">
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/support" className="w-full cursor-pointer">
                      Help & Support
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/safety" className="w-full cursor-pointer">
                      Safety
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            !isAuthenticated && (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  );
}