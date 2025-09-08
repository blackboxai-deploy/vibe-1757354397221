'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { LoginFormData } from '@/lib/types';
import { validateEmail } from '@/lib/auth';

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'rider' | 'driver'>('rider');
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    userType: 'rider',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginError, setLoginError] = useState<string>('');

  const handleTabChange = (tab: 'rider' | 'driver') => {
    setActiveTab(tab);
    setFormData(prev => ({ ...prev, userType: tab }));
    setErrors({});
    setLoginError('');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoginError('');
    
    const result = await login(formData);
    
    if (result.success) {
      // Redirect will be handled by the auth context
      const dashboardRoute = formData.userType === 'rider' ? '/rider/dashboard' : '/driver/dashboard';
      router.push(dashboardRoute);
    } else {
      setLoginError(result.error || 'Login failed. Please try again.');
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">RideShare</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as 'rider' | 'driver')} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="rider" className="flex items-center space-x-2">
                <span>🚗</span>
                <span>Rider</span>
              </TabsTrigger>
              <TabsTrigger value="driver" className="flex items-center space-x-2">
                <span>🚙</span>
                <span>Driver</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rider" className="mt-6">
              <p className="text-sm text-gray-600 mb-4 text-center">
                Sign in to book rides and manage your trips
              </p>
            </TabsContent>

            <TabsContent value="driver" className="mt-6">
              <p className="text-sm text-gray-600 mb-4 text-center">
                Sign in to start accepting rides and track your earnings
              </p>
            </TabsContent>
          </Tabs>

          {loginError && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {loginError}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500 focus:ring-red-500' : ''}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={errors.password ? 'border-red-500 focus:ring-red-500' : ''}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                `Sign In as ${activeTab === 'rider' ? 'Rider' : 'Driver'}`
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                href="/auth/signup"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-semibold mb-2">Demo Credentials:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Rider:</strong> rider@demo.com / password123</p>
              <p><strong>Driver:</strong> driver@demo.com / password123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}