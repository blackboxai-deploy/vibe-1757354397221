import { NextRequest, NextResponse } from 'next/server';
import { LoginFormData, User, AuthResponse, ApiResponse } from '@/lib/types';
import { generateMockUser } from '@/lib/auth';

// Mock user database - In a real app, this would be a proper database
const MOCK_USERS: Record<string, User & { password: string }> = {
  'rider@demo.com': {
    ...generateMockUser('rider', 'rider@demo.com', 'Demo Rider'),
    password: 'password123',
    id: 'rider_demo_001',
  },
  'driver@demo.com': {
    ...generateMockUser('driver', 'driver@demo.com', 'Demo Driver'),
    password: 'password123',
    id: 'driver_demo_001',
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: LoginFormData = await request.json();
    const { email, password, userType } = body;

    // Validate input
    if (!email || !password || !userType) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Email, password, and user type are required',
      }, { status: 400 });
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user exists and password is correct
    const user = MOCK_USERS[email.toLowerCase()];
    if (!user || user.password !== password) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Invalid email or password',
      }, { status: 401 });
    }

    // Check if user type matches
    if (user.userType !== userType) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: `This email is registered as a ${user.userType}, not a ${userType}`,
      }, { status: 401 });
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Generate mock JWT token (in a real app, use a proper JWT library)
    const token = `mock_jwt_${user.id}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        expiresAt,
      },
      message: 'Login successful',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}