import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '845893107647-hj6kv9acb6oge2ej4citu5jglft4e0uq.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://test.nxtdev.in';

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(error || 'Google authorization failed')}`);
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${appUrl}/api/auth/google/callback`,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenRes.ok) {
      const errJson = await tokenRes.json();
      return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(errJson.error_description || 'Failed to exchange code')}`);
    }

    const tokens = await tokenRes.json();
    const idTokenInfo = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokens.id_token}`);
    const tokenPayload = await idTokenInfo.json();

    const email = tokenPayload.email;
    const name = tokenPayload.name || tokenPayload.given_name || '';
    const picture = tokenPayload.picture || '';

    if (!email) {
      return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent('No email received from Google')}`);
    }

    await connectToDatabase();
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        email: email.toLowerCase(),
        name: name,
        picture: picture,
        passwordHash: '',
        role: 'user'
      });
    } else {
      let updated = false;
      if (name && !user.name) {
        user.name = name;
        updated = true;
      }
      if (picture && user.picture !== picture) {
        user.picture = picture;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role
    });

    const response = NextResponse.redirect(`${appUrl}/tracker/agenda`);

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return response;
  } catch (err: any) {
    console.error('Google Callback Error:', err);
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(err?.message || 'Authentication error')}`);
  }
}
