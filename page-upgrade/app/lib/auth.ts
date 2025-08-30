import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import {NextRequest, NextResponse} from "next/server";

const secret = process.env.JWT_KEY!;
const key = new TextEncoder().encode(secret);

async function generateSHA256Hash(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function encrypt(payload:any){
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(key);
}

export async function decrypt(input: string) {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ['HS256'],
    });
    return payload;
}

export async function getSession() {
    try {
        const session = (await cookies()).get('session')?.value;
        if (!session) return null;
        return await decrypt(session);
    }
    catch (err){
        // @ts-ignore
        console.error(err.code)
        await logOut();
        return null;
    }
}

export async function updateSession(request: NextRequest){
    const session = request.cookies.get('session')?.value;
    if (!session) return;

    const parsed = await decrypt(session);
    parsed.expires = new Date(Date.now() + 60 * 60 * 1000);
    const res = NextResponse.next();
    // @ts-ignore
    res.cookies.set({
        name: 'session',
        value: await encrypt(parsed),
        httpOnly: true,
        expires: parsed.expires,
    });
    return res;
}

export async function logOut(){
    try{
    const session = (await cookies()).get('session')?.value;
    if (!session) return;
    (await cookies()).delete('session');
    return NextResponse.json({result: 'Sesión Cerrada'},{status: 200});
    }
    catch(error){
        console.error(error);
        return NextResponse.json({error: 'Ocurrió un error'},
            {status: 500});
    }
}

export { generateSHA256Hash };