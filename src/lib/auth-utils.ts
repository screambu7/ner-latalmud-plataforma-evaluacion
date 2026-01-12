import { cookies } from 'next/headers';

export async function setUserIdCookie(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set('user_id', userId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });
}

export async function clearUserIdCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('user_id');
}



