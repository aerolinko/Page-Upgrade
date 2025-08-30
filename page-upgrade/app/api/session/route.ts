import {NextRequest, NextResponse} from "next/server";
import {getSession} from "@/app/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const session=await getSession();
        return NextResponse.json({session}, {status: 200});
    }
    catch(err){
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}