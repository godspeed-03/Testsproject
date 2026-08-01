import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '845893107647-hj6kv9acb6oge2ej4citu5jglft4e0uq.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { credential, code, redirectUri } = body;

    let email = '';
    let name = '';

    if (credential) {
      // Verify Google ID Token via Google tokeninfo endpoint
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      if (!googleRes.ok) {
        const errorData = await googleRes.json();
        return NextResponse.json({ error: errorData.error_description || 'Invalid Google credential' }, { status: 400 });
      }

      const tokenPayload = await googleRes.json();
      
      // Verify audience matches client id
      if (tokenPayload.aud !== GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes(tokenPayload.aud)) {
        console.warn('Google client ID mismatch warning:', tokenPayload.aud);
      }

      email = tokenPayload.email;
      name = tokenPayload.name || tokenPayload.given_name || '';
    } else if (code) {
      // Exchange Authorization Code for Tokens
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri || `${process.env.NEXT_PUBLIC_APP_URL || 'https://test.nxtdev.in'}/tracker`,
          grant_type: 'authorization_code'
        })
      });

      if (!tokenRes.ok) {
        const errJson = await tokenRes.json();
        return NextResponse.json({ error: errJson.error_description || 'Failed to exchange authorization code' }, { status: 400 });
      }

      const tokens = await tokenRes.json();
      const idTokenInfo = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokens.id_token}`);
      const tokenPayload = await idTokenInfo.json();
      email = tokenPayload.email;
      name = tokenPayload.name || '';
    } else {
      return NextResponse.json({ error: 'Missing credential or code' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Failed to retrieve email from Google Account' }, { status: 400 });
    }

    await connectToDatabase();
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        email: email.toLowerCase(),
        name: name,
        passwordHash: '',
        role: 'user'
      });
    } else if (name && !user.name) {
      user.name = name;
      await user.save();
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    const response = NextResponse.json({
      message: 'Authenticated successfully via Google',
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return response;
  } catch (error: any) {
    console.error('Google Auth error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error during Google Sign-In' }, { status: 500 });
  }
}
