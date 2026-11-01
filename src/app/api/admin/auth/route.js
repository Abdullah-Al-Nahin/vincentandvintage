import { NextResponse } from 'next/server';
import {
  validateAdminCredentials,
  createAdminToken,
  verifyAdminSession,
  COOKIE_NAME
} from '@/lib/auth';

export async function GET(request) {
  const authenticated = verifyAdminSession(request);
  return NextResponse.json({ authenticated });
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Handle Logout
    if (body.action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
      response.cookies.set({
        name: COOKIE_NAME,
        value: '',
        path: '/',
        httpOnly: true,
        maxAge: 0,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
      return response;
    }

    // Handle Login
    const { username, password } = body;
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const isValid = validateAdminCredentials(username.trim(), password);
    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid administrative credentials.' },
        { status: 401 }
      );
    }

    const token = createAdminToken(username.trim());
    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful.',
      token
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      path: '/',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    return response;
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

