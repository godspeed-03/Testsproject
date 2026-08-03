import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL as string;

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
        grant_type: 'authorization_code',
      }),
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

    const cleanEmail = email.toLowerCase().trim();
    let user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: name,
          picture: picture,
          passwordHash: '',
          role: 'user',
        },
      });
    } else {
      const needsNameUpdate = name && !user.name;
      const needsPicUpdate = picture && user.picture !== picture;
      if (needsNameUpdate || needsPicUpdate) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: needsNameUpdate ? name : user.name,
            picture: needsPicUpdate ? picture : user.picture,
          },
        });
      }
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
      picture: user.picture || undefined,
      role: user.role as 'admin' | 'user',
    });

    const response = NextResponse.redirect(`${appUrl}/tracker/agenda`);

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (err: any) {
    console.error('Google Callback Error:', err);
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(err?.message || 'Authentication error')}`);
  }
}
