import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      // Auto-create new user account if not registered yet
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          role: 'user',
        },
      });
    } else {
      // Validate password for existing account
      if (user.passwordHash) {
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
          return NextResponse.json({ error: 'Incorrect password for existing account' }, { status: 401 });
        }
      }
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'admin' | 'user',
    });

    const response = NextResponse.json({
      message: 'Authenticated successfully',
      user: { id: user.id, email: user.email, role: user.role },
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
  } catch (error) {
    console.error('Unified Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
