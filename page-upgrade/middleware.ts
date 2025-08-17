import {NextRequest, NextResponse} from 'next/server';
import { updateSession, getSession } from '@/app/lib/auth';

export async function middleware(request: NextRequest) {
    if(await getSession()) {
        return await updateSession(request);
    }
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/', request.url))
    }

}
