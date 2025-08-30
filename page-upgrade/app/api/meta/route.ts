import {NextRequest, NextResponse} from "next/server";
import {getDataGoalPerMonth} from "@/app/lib/db";

export async function GET(request: NextRequest) {
    try {
        const data=await getDataGoalPerMonth()
        return NextResponse.json({data}, {status: 200});
    }
    catch(err){
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}