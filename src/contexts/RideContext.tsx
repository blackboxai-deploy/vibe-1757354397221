'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Ride, RideRequest, Location, Driver, BookRideFormData } from '@/lib/types';
import { useAuth } from './AuthContext';

interface RideContextType {
  // Current ride state
  currentRide: Ride | null;
  isBooking: boolean;
  bookingError: string | null;
  
  // Driver-specific state
  incomingRequests: RideRequest[];
  isOnline: boolean;
  
  // Rider-specific state
  searchingForDriver: boolean;
  matchedDriver: Driver | null;
  
  // Actions
  bookRide: (bookingData: BookRideFormData) => Promise<{ success: boolean; error?: string }>;
  cancelRide: (rideId: string) => Promise<{ success: boolean; error?: string }>;
  acceptRideRequest: (requestId: string) => Promise<{ success: boolean; error?: string }>;
  rejectRideRequest: (requestId: string) => Promise<{ success: boolean; error?: string }>;
  toggleDriverAvailability: () => Promise<{ success: boolean; error?: string }>;
  updateRideStatus: (rideId: string, status: Ride['status']) => Promise<{ success: boolean; error?: string }>;
  updateDriverLocation: (location: Location) => Promise<void>;
  
  // Real-time updates
  startLocationTracking: () => void;
  stopLocationTracking: () => void;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

interface RideProviderProps {
  children: ReactNode;
}

export function RideProvider({ children }: RideProviderProps) {
  const { user, isAuthenticated } = useAuth();
  
  // Ride state
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  
  // Driver state
  const [incomingRequests, setIncomingRequests] = useState<RideRequest[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  
  // Rider state
  const [searchingForDriver, setSearchingForDriver] = useState(false);
  const [matchedDriver, setMatchedDriver] = useState<Driver | null>(null);
  
  // Location tracking
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);

  // Initialize ride state on auth change
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setCurrentRide(null);
      setIncomingRequests([]);
      setIsOnline(false);
      setSearchingForDriver(false);
      setMatchedDriver(null);
      stopLocationTracking();
    } else {
      // Load current ride from API or localStorage
      loadCurrentRide();
      if (user.userType === 'driver') {
        loadDriverState();
      }
    }
  }, [user, isAuthenticated]);

  const loadCurrentRide = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/rides/current', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('rideshare_auth_token')}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setCurrentRide(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to load current ride:', error);
    }
  };

  const loadDriverState = async () => {
    if (!user || user.userType !== 'driver') return;
    
    try {
      const response = await fetch('/api/driver/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('rideshare_auth_token')}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setIsOnline(result.data.isOnline);
          setIncomingRequests(result.data.incomingRequests || []);
        }
      }
    } catch (error) {
      console.error('Failed to load driver state:', error);
    }
  };

  const bookRide = async (bookingData: BookRideFormData): Promise<{ success: boolean; error?: string }> => {
    if (!user || user.userType !== 'rider') {
      return { success: false, error: 'Only riders can book rides' };
    }

    setIsBooking(true);
    setBookingError(null);
    setSearchingForDriver(true);

    try {
      const response = await fetch('/api/rides/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('rideshare_auth_token')}`,
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setCurrentRide(result.data.ride);
        
        // Start looking for driver
        if (result.data.driver) {
          setMatchedDriver(result.data.driver);
          setSearchingForDriver(false);
        }
        
        return { success: true };
      } else {
        setBookingError(result.error || 'Failed to book ride');
        setSearchingForDriver(false);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setBookingError('Network error. Please try again.');
      setSearchingForDriver(false);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setIsBooking(false);
    }
  };

  const cancelRide = async (rideId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/rides/${rideId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('rideshare_auth_token')}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setCurrentRide(null);
        setMatchedDriver(null);
        setSearchingForDriver(false);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to cancel ride' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const acceptRideRequest = async (requestId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user || user.userType !== 'driver') {
      return { success: false, error: 'Only drivers can accept rides' };
    }

    try {
      const response = await fetch(`/api/rides/requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('rideshare_auth_token')}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        setCurrentRide(result.data);
        setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to accept ride' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const rejectRideRequest = async (requestId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/rides/requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('rideshare_auth_token')}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to reject ride' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const toggleDriverAvailability = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user || user.userType !== 'driver') {
      return { success: false, error: 'Only drivers can toggle availability' };
    }

    try {
      const response = await fetch('/api/driver/toggle-availability', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('rideshare_auth_token')}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setIsOnline(!isOnline);
        
        if (!isOnline) {
          startLocationTracking();
        } else {
          stopLocationTracking();
        }
        
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to update availability' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const updateRideStatus = async (rideId: string, status: Ride['status']): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/rides/${rideId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('rideshare_auth_token')}`,
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setCurrentRide(result.data);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to update ride status' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const updateDriverLocation = async (location: Location): Promise<void> => {
    if (!user || user.userType !== 'driver' || !isOnline) return;

    try {
      await fetch('/api/driver/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('rideshare_auth_token')}`,
        },
        body: JSON.stringify({ location }),
      });
    } catch (error) {
      console.error('Failed to update driver location:', error);
    }
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation || locationWatchId !== null) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: '', // Will be filled by reverse geocoding
          city: '',
          state: '',
          zipCode: '',
        };
        updateDriverLocation(location);
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );

    setLocationWatchId(watchId);
  };

  const stopLocationTracking = () => {
    if (locationWatchId !== null) {
      navigator.geolocation.clearWatch(locationWatchId);
      setLocationWatchId(null);
    }
  };

  const value: RideContextType = {
    currentRide,
    isBooking,
    bookingError,
    incomingRequests,
    isOnline,
    searchingForDriver,
    matchedDriver,
    bookRide,
    cancelRide,
    acceptRideRequest,
    rejectRideRequest,
    toggleDriverAvailability,
    updateRideStatus,
    updateDriverLocation,
    startLocationTracking,
    stopLocationTracking,
  };

  return <RideContext.Provider value={value}>{children}</RideContext.Provider>;
}

export function useRide() {
  const context = useContext(RideContext);
  if (context === undefined) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
}