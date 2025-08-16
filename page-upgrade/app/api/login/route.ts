import { NextResponse} from "next/server";
import {getUser} from "@/app/lib/db";
import {cookies} from "next/headers";
import {encrypt,generateSHA256Hash} from "@/app/lib/auth";
export const runtime = 'nodejs';

export async function POST(request: Request) {
    try{
        const { username, password } = await request.json();
        const hashedpassword =await generateSHA256Hash(password);
        const result = await getUser(username, hashedpassword);
        if (result){
            const expires = new Date(Date.now() + 10 * 1000);
            const session = await encrypt({result, expires});
            (await cookies()).set('session', session, { expires, httpOnly: true });
            return NextResponse.json({result}, {status: 200});
        }
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    catch(err){
        console.error('Error during login:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


