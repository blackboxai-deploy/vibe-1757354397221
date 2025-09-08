'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { SignupFormData, VEHICLE_TYPES } from '@/lib/types';
import { validateEmail, validatePhone, validatePassword } from '@/lib/auth';

export function SignupForm() {
  const router = useRouter();
  const { signup, isLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'rider' | 'driver'>('rider');
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'rider',
    vehicleInfo: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      licensePlate: '',
      vehicleType: 'economy',
    },
    licenseNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [signupError, setSignupError] = useState<string>('');

  const handleTabChange = (tab: 'rider' | 'driver') => {
    setActiveTab(tab);
    setFormData(prev => ({ ...prev, userType: tab }));
    setErrors({});
    setSignupError('');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Driver-specific validation
    if (formData.userType === 'driver') {
      if (!formData.vehicleInfo?.make.trim()) {
        newErrors.vehicleMake = 'Vehicle make is required';
      }
      if (!formData.vehicleInfo?.model.trim()) {
        newErrors.vehicleModel = 'Vehicle model is required';
      }
      if (!formData.vehicleInfo?.color.trim()) {
        newErrors.vehicleColor = 'Vehicle color is required';
      }
      if (!formData.vehicleInfo?.licensePlate.trim()) {
        newErrors.licensePlate = 'License plate is required';
      }
      if (!formData.licenseNumber?.trim()) {
        newErrors.licenseNumber = 'Driver license number is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSignupError('');
    
    const result = await signup(formData);
    
    if (result.success) {
      const dashboardRoute = formData.userType === 'rider' ? '/rider/dashboard' : '/driver/dashboard';
      router.push(dashboardRoute);
    } else {
      setSignupError(result.error || 'Registration failed. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (field.startsWith('vehicle.')) {
      const vehicleField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vehicleInfo: {
          ...prev.vehicleInfo!,
          [vehicleField]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <Card className="w-full max-w-lg shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">RideShare</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Join RideShare</CardTitle>
          <CardDescription className="text-gray-600">
            Create your account to get started
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
                Book rides instantly and manage your transportation needs
              </p>
            </TabsContent>

            <TabsContent value="driver" className="mt-6">
              <p className="text-sm text-gray-600 mb-4 text-center">
                Start earning by providing rides to passengers in your area
              </p>
            </TabsContent>
          </Tabs>

          {signupError && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {signupError}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Driver-specific fields */}
            {activeTab === 'driver' && (
              <>
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Vehicle Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleMake">Make</Label>
                      <Input
                        id="vehicleMake"
                        placeholder="e.g. Toyota"
                        value={formData.vehicleInfo?.make || ''}
                        onChange={(e) => handleInputChange('vehicle.make', e.target.value)}
                        className={errors.vehicleMake ? 'border-red-500' : ''}
                        disabled={isLoading}
                      />
                      {errors.vehicleMake && <p className="text-xs text-red-600">{errors.vehicleMake}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicleModel">Model</Label>
                      <Input
                        id="vehicleModel"
                        placeholder="e.g. Camry"
                        value={formData.vehicleInfo?.model || ''}
                        onChange={(e) => handleInputChange('vehicle.model', e.target.value)}
                        className={errors.vehicleModel ? 'border-red-500' : ''}
                        disabled={isLoading}
                      />
                      {errors.vehicleModel && <p className="text-xs text-red-600">{errors.vehicleModel}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleYear">Year</Label>
                      <Input
                        id="vehicleYear"
                        type="number"
                        min="2000"
                        max={new Date().getFullYear() + 1}
                        value={formData.vehicleInfo?.year || ''}
                        onChange={(e) => handleInputChange('vehicle.year', parseInt(e.target.value))}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicleColor">Color</Label>
                      <Input
                        id="vehicleColor"
                        placeholder="e.g. Blue"
                        value={formData.vehicleInfo?.color || ''}
                        onChange={(e) => handleInputChange('vehicle.color', e.target.value)}
                        className={errors.vehicleColor ? 'border-red-500' : ''}
                        disabled={isLoading}
                      />
                      {errors.vehicleColor && <p className="text-xs text-red-600">{errors.vehicleColor}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleType">Vehicle Type</Label>
                      <Select
                        value={formData.vehicleInfo?.vehicleType || 'economy'}
                        onValueChange={(value) => handleInputChange('vehicle.vehicleType', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(VEHICLE_TYPES).map(([key, type]) => (
                            <SelectItem key={key} value={key}>
                              {type.name} - {type.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licensePlate">License Plate</Label>
                      <Input
                        id="licensePlate"
                        placeholder="ABC-1234"
                        value={formData.vehicleInfo?.licensePlate || ''}
                        onChange={(e) => handleInputChange('vehicle.licensePlate', e.target.value.toUpperCase())}
                        className={errors.licensePlate ? 'border-red-500' : ''}
                        disabled={isLoading}
                      />
                      {errors.licensePlate && <p className="text-xs text-red-600">{errors.licensePlate}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Driver License Number</Label>
                    <Input
                      id="licenseNumber"
                      placeholder="Your driver license number"
                      value={formData.licenseNumber || ''}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      className={errors.licenseNumber ? 'border-red-500' : ''}
                      disabled={isLoading}
                    />
                    {errors.licenseNumber && <p className="text-xs text-red-600">{errors.licenseNumber}</p>}
                  </div>
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                `Create ${activeTab === 'rider' ? 'Rider' : 'Driver'} Account`
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}