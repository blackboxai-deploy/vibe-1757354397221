'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      // Redirect authenticated users to their dashboard
      const dashboardRoute = user.userType === 'rider' ? '/rider/dashboard' : '/driver/dashboard';
      router.push(dashboardRoute);
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Navigation */}
        <nav className="relative z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">RideShare</span>
              </div>
              <div className="flex space-x-4">
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
              Your Ride,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Your Way
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience the future of transportation. Book instant rides, earn as a driver, 
              or schedule trips in advance. Safe, reliable, and affordable rides at your fingertips.
            </p>

            {/* CTA Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <img src="https://placehold.co/64x64/ffffff/3b82f6?text=🚗&font=source-sans-pro" alt="Passenger car icon" className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Need a Ride?</CardTitle>
                  <CardDescription className="text-gray-600 text-lg">
                    Book instantly and get matched with nearby drivers in seconds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/auth/signup?type=rider">
                    <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3">
                      Book a Ride
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-200 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <img src="https://placehold.co/64x64/ffffff/22c55e?text=💰&font=source-sans-pro" alt="Earnings money icon" className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Drive & Earn</CardTitle>
                  <CardDescription className="text-gray-600 text-lg">
                    Turn your car into a money-making machine. Drive on your schedule
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/auth/signup?type=driver">
                    <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3">
                      Start Driving
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose RideShare?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to providing the best transportation experience with safety, 
              reliability, and convenience at the forefront.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <img src="https://placehold.co/80x80/ffffff/3b82f6?text=⚡&font=source-sans-pro" alt="Fast service lightning icon" className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600">
                Get matched with nearby drivers in under 30 seconds. No more waiting around.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <img src="https://placehold.co/80x80/ffffff/22c55e?text=🛡️&font=source-sans-pro" alt="Safety shield protection icon" className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Safety First</h3>
              <p className="text-gray-600">
                All drivers are background-checked and verified. Real-time tracking for peace of mind.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <img src="https://placehold.co/80x80/ffffff/8b5cf6?text=💳&font=source-sans-pro" alt="Affordable pricing dollar icon" className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Fair Pricing</h3>
              <p className="text-gray-600">
                Transparent, competitive rates with no hidden fees. What you see is what you pay.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-2xl font-bold">RideShare</span>
            </div>
            <p className="text-gray-400 mb-8">
              Making transportation accessible, reliable, and affordable for everyone.
            </p>
            <div className="flex justify-center space-x-8">
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/safety" className="text-gray-400 hover:text-white transition-colors">
                Safety
              </Link>
              <Link href="/support" className="text-gray-400 hover:text-white transition-colors">
                Support
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-gray-500">
              <p>&copy; 2024 RideShare. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}