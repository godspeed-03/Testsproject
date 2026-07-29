import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import NavbarClient from './NavbarClient';

export default async function Navbar() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  let user = null;

  if (token) {
    user = verifyToken(token);
  }

  return <NavbarClient user={user} />;
}
