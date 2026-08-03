import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;

function decodeJwtPayload(jwt: string): any {
  try {
    const parts = jwt.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64url').toString('utf-8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { credential, code, redirectUri } = body;

    let email = '';
    let name = '';
    let picture = '';

    if (credential) {
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      if (!googleRes.ok) {
        const errorData = await googleRes.json();
        return NextResponse.json({ error: errorData.error_description || 'Invalid Google credential' }, { status: 400 });
      }

      const tokenInfoPayload = await googleRes.json();
      if (tokenInfoPayload.aud !== GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes(tokenInfoPayload.aud)) {
        console.warn('Google client ID mismatch warning:', tokenInfoPayload.aud);
      }

      const jwtPayload = decodeJwtPayload(credential);
      email = tokenInfoPayload.email || jwtPayload?.email || '';
      name = jwtPayload?.name || jwtPayload?.given_name || tokenInfoPayload.name || '';
      picture = jwtPayload?.picture || '';
    } else if (code) {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri || `${process.env.NEXT_PUBLIC_APP_URL as string}/tracker`,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenRes.ok) {
        const errJson = await tokenRes.json();
        return NextResponse.json({ error: errJson.error_description || 'Failed to exchange authorization code' }, { status: 400 });
      }

      const tokens = await tokenRes.json();
      const jwtPayload = decodeJwtPayload(tokens.id_token);
      email = jwtPayload?.email || '';
      name = jwtPayload?.name || jwtPayload?.given_name || '';
      picture = jwtPayload?.picture || '';
    } else {
      return NextResponse.json({ error: 'Missing credential or code' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Failed to retrieve email from Google Account' }, { status: 400 });
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

    const response = NextResponse.json({
      message: 'Authenticated successfully via Google',
      user: { id: user.id, email: user.email, name: user.name, picture: user.picture, role: user.role },
    });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error: any) {
    console.error('Google Auth error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error during Google Sign-In' }, { status: 500 });
  }
}
