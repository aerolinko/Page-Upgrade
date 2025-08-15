import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/app/lib/auth';

export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/api') ||
        request.nextUrl.pathname.includes('.')) {
        return NextResponse.next();
    }

    const response = NextResponse.next();
    await updateSession(request);

    return response;
}
