// Core type definitions for the rideshare application

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  userType: 'rider' | 'driver';
  profileImage?: string;
  rating: number;
  createdAt: string;
}

export interface Rider extends User {
  userType: 'rider';
  paymentMethods: PaymentMethod[];
  preferredVehicleType?: VehicleType;
  emergencyContact?: EmergencyContact;
}

export interface Driver extends User {
  userType: 'driver';
  vehicle: Vehicle;
  license: DriverLicense;
  earnings: Earnings;
  isOnline: boolean;
  currentLocation?: Location;
  documentsVerified: boolean;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vehicleType: VehicleType;
  capacity: number;
  photos: string[];
  insurance: Insurance;
}

export type VehicleType = 'economy' | 'comfort' | 'premium' | 'xl';

export interface DriverLicense {
  number: string;
  expiryDate: string;
  state: string;
  verified: boolean;
}

export interface Insurance {
  provider: string;
  policyNumber: string;
  expiryDate: string;
  verified: boolean;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Ride {
  id: string;
  riderId: string;
  driverId?: string;
  status: RideStatus;
  pickupLocation: Location;
  destination: Location;
  requestedAt: string;
  acceptedAt?: string;
  arrivedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  vehicleType: VehicleType;
  fare: Fare;
  route?: RoutePoint[];
  estimatedArrival?: string;
  actualArrival?: string;
  riderRating?: number;
  driverRating?: number;
  notes?: string;
}

export type RideStatus = 
  | 'requested' 
  | 'accepted' 
  | 'driver_arrived' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface Fare {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeFare: number;
  totalFare: number;
  currency: string;
  breakdown: FareBreakdown;
}

export interface FareBreakdown {
  baseRate: number;
  perMileRate: number;
  perMinuteRate: number;
  surgeMultiplier: number;
  distance: number;
  duration: number;
  fees: ServiceFee[];
}

export interface ServiceFee {
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'digital_wallet';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  billingAddress: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Earnings {
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  totalEarnings: number;
  pendingPayout: number;
  lastPayoutDate?: string;
  ridesCompleted: number;
  hoursOnline: number;
  averageRating: number;
}

export interface RideRequest {
  id: string;
  riderId: string;
  riderName: string;
  riderRating: number;
  pickupLocation: Location;
  destination: Location;
  vehicleType: VehicleType;
  estimatedFare: number;
  estimatedDistance: number;
  estimatedDuration: number;
  requestedAt: string;
  expiresAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: string;
}

export interface RideMatchResponse {
  matched: boolean;
  driver?: Driver;
  estimatedArrival?: string;
  trackingId?: string;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
  userType: 'rider' | 'driver';
}

export interface SignupFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  userType: 'rider' | 'driver';
  // Driver-specific fields
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
    vehicleType: VehicleType;
  };
  licenseNumber?: string;
}

export interface BookRideFormData {
  pickupAddress: string;
  pickupLocation: Location;
  destinationAddress: string;
  destinationLocation: Location;
  vehicleType: VehicleType;
  scheduledFor?: string;
  notes?: string;
  paymentMethodId: string;
}

// UI State types
export interface UIState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

export interface MapState {
  center: [number, number];
  zoom: number;
  markers: MapMarker[];
  route?: RoutePoint[];
  userLocation?: Location;
}

export interface MapMarker {
  id: string;
  position: [number, number];
  type: 'pickup' | 'destination' | 'driver' | 'user';
  label?: string;
  icon?: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'ride_request' | 'driver_arrived' | 'ride_started' | 'ride_completed' | 'payment_processed';
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  read: boolean;
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'location_update' | 'ride_status_change' | 'driver_match' | 'ride_request';
  payload: any;
  timestamp: string;
}

export interface LocationUpdate {
  userId: string;
  location: Location;
  heading?: number;
  speed?: number;
  timestamp: string;
}

// Constants
export const VEHICLE_TYPES: { [key in VehicleType]: { name: string; description: string; capacity: number; priceMultiplier: number } } = {
  economy: {
    name: 'Economy',
    description: 'Affordable rides for everyday trips',
    capacity: 4,
    priceMultiplier: 1.0
  },
  comfort: {
    name: 'Comfort',
    description: 'More space and higher-end vehicles',
    capacity: 4,
    priceMultiplier: 1.3
  },
  premium: {
    name: 'Premium',
    description: 'Luxury vehicles for special occasions',
    capacity: 4,
    priceMultiplier: 2.0
  },
  xl: {
    name: 'XL',
    description: 'Larger vehicles for groups',
    capacity: 6,
    priceMultiplier: 1.5
  }
};