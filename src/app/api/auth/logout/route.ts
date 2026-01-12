import { NextResponse } from 'next/server';
import { clearUserIdCookie } from '@/lib/auth-utils';

export async function POST() {
  await clearUserIdCookie();
  return NextResponse.json({ success: true });
}



