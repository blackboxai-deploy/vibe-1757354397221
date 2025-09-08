import { NextRequest, NextResponse } from 'next/server';
import { SignupFormData, User, AuthResponse, ApiResponse } from '@/lib/types';

// Mock user storage - In a real app, this would be a proper database
const mockUsers: Map<string, User & { password: string }> = new Map();

// Initialize with demo users
mockUsers.set('rider@demo.com', {
  id: 'rider_demo_001',
  email: 'rider@demo.com',
  name: 'Demo Rider',
  phone: '+1(555)123-4567',
  userType: 'rider',
  rating: 4.8,
  createdAt: new Date().toISOString(),
  password: 'password123',
});

mockUsers.set('driver@demo.com', {
  id: 'driver_demo_001',
  email: 'driver@demo.com',
  name: 'Demo Driver',
  phone: '+1(555)987-6543',
  userType: 'driver',
  rating: 4.9,
  createdAt: new Date().toISOString(),
  password: 'password123',
});

export async function POST(request: NextRequest) {
  try {
    const body: SignupFormData = await request.json();
    const { name, email, phone, password, userType, vehicleInfo, licenseNumber } = body;

    // Validate input
    if (!name || !email || !phone || !password || !userType) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'All basic fields are required',
      }, { status: 400 });
    }

    // Validate driver-specific fields
    if (userType === 'driver') {
      if (!vehicleInfo || !licenseNumber) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: 'Vehicle information and license number are required for drivers',
        }, { status: 400 });
      }

      if (!vehicleInfo.make || !vehicleInfo.model || !vehicleInfo.color || !vehicleInfo.licensePlate) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: 'Complete vehicle information is required',
        }, { status: 400 });
      }
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if user already exists
    if (mockUsers.has(email.toLowerCase())) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'An account with this email already exists',
      }, { status: 409 });
    }

    // Generate user ID
    const userId = `${userType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create new user
    const newUser: User & { password: string } = {
      id: userId,
      email: email.toLowerCase(),
      name,
      phone,
      userType,
      rating: userType === 'rider' ? 5.0 : 4.5, // New users start with good ratings
      createdAt: new Date().toISOString(),
      password,
    };

    // Store user (in a real app, hash the password)
    mockUsers.set(email.toLowerCase(), newUser);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    // Generate mock JWT token
    const token = `mock_jwt_${userId}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        expiresAt,
      },
      message: 'Account created successfully',
    };

    // In a real app, you might also:
    // - Send a welcome email
    // - Create additional records (driver vehicle info, etc.)
    // - Trigger background verification processes for drivers

    return NextResponse.json(response);
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

// Get all users (for debugging - remove in production)
export async function GET() {
  const users = Array.from(mockUsers.values()).map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  return NextResponse.json({
    success: true,
    data: users,
    message: `Found ${users.length} registered users`,
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}