import {NextRequest, NextResponse} from "next/server";
import {getUser} from "@/app/lib/db";
import {cookies} from "next/headers";
import {encrypt, generateSHA256Hash, getSession} from "@/app/lib/auth";
export const runtime = 'nodejs';

export async function POST(request: Request) {
    try{
        const { username, password } = await request.json();
        const hashedpassword =await generateSHA256Hash(password);
        const payload = await getUser(username, hashedpassword);
        if (payload) {
            const expires = new Date(Date.now() + 60 * 60 * 1000);
            const session = await encrypt({payload, expires});
            (await cookies()).set('session', session, { expires, httpOnly: true });
            return NextResponse.json({payload}, {status: 200});
        }
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    catch(err){
        console.error('Error during login:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const session=await getSession();
        return NextResponse.json({session}, {status: 200});
    }
    catch(err){
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

