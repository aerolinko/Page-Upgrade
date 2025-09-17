import {NextRequest, NextResponse} from 'next/server';
import { updateSession, getSession } from '@/app/lib/auth';

export async function middleware(request: NextRequest) {

    const PUBLIC_ROUTES=[
        '/api/login'
    ]

    if(PUBLIC_ROUTES.some(url => url===request.nextUrl.pathname )){
       return NextResponse.next({request});
    }

    if(await getSession()) {
        if(request.method == 'PATCH' || request.method == 'DELETE'){
         const session = await getSession();
         // @ts-ignore
            if(session.payload.rol!='admin' && session.payload.rol!='presidente'){
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }
        }
        return await updateSession(request);
    }

    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

}
